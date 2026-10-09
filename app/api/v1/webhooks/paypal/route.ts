import { NextRequest, NextResponse } from "next/server";
import { settlementService } from "@/lib/services/settlement.service";
import { idempotencyService } from "@/lib/services/idempotency.service";
import { verifyPayPalWebhookSignature } from "@/lib/paypal/orders";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authAlgo = req.headers.get("paypal-auth-algo");
    const certUrl = req.headers.get("paypal-cert-url");
    const transmissionId = req.headers.get("paypal-transmission-id");
    const transmissionSig = req.headers.get("paypal-transmission-sig");
    const transmissionTime = req.headers.get("paypal-transmission-time");

    // Fail closed: Missing verification headers must be rejected
    if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_VERIFICATION_HEADERS",
            message: "Missing required PayPal webhook cryptographic verification headers.",
          },
        },
        { status: 400 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "MALFORMED_JSON_PAYLOAD",
            message: "Request body could not be parsed as valid JSON.",
          },
        },
        { status: 400 }
      );
    }

    // Step 2: Cryptographic Signature Verification via official PayPal API
    const verification = await verifyPayPalWebhookSignature({
      authAlgo,
      certUrl,
      transmissionId,
      transmissionSig,
      transmissionTime,
      eventBody: body,
    });

    if (!verification.verified) {
      return NextResponse.json(
        {
          error: {
            code: "WEBHOOK_SIGNATURE_VERIFICATION_FAILED",
            message: verification.error || "PayPal webhook signature verification failed.",
          },
        },
        { status: 401 }
      );
    }

    const eventType = (body.event_type || body.eventType) as string;
    const eventId = (body.id as string) || transmissionId;

    // Webhook Idempotency by provider + eventId
    const existing = await idempotencyService.getExistingRecord(eventId, "webhooks:paypal");
    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "Webhook already processed",
      });
    }

    if (eventType === "CHECKOUT.ORDER.COMPLETED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = (body.resource as Record<string, unknown>) || {};
      const supplementaryData = (resource.supplementary_data as Record<string, unknown>) || {};
      const relatedIds = (supplementaryData.related_ids as Record<string, unknown>) || {};
      
      const orderId = (resource.id as string) || (relatedIds.order_id as string);
      if (orderId) {
        try {
          await settlementService.captureSettlement(orderId);
        } catch (err) {
          console.warn("[PayPal Webhook Warning]:", err instanceof Error ? err.message : err);
        }
      }
    }

    await idempotencyService.saveRecord(
      eventId,
      "webhooks:paypal",
      idempotencyService.hashRequest(body),
      200,
      { success: true, processed: true }
    );

    return NextResponse.json({ success: true, eventId, eventType, verified: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "WEBHOOK_PROCESSING_FAILED",
          message: error instanceof Error ? error.message : "Failed to process webhook event",
        },
      },
      { status: 400 }
    );
  }
}

