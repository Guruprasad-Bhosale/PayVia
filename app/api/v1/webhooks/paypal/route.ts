import { NextRequest, NextResponse } from "next/server";
import { settlementService } from "@/lib/services/settlement.service";
import { idempotencyService } from "@/lib/services/idempotency.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.event_type || body.eventType;
    const eventId = body.id || `evt_${Date.now()}`;

    // Webhook Idempotency by provider + eventId
    const existing = await idempotencyService.getExistingRecord(eventId, "webhooks:paypal");
    if (existing) {
      return NextResponse.json({ success: true, duplicate: true, message: "Webhook already processed" });
    }

    if (eventType === "CHECKOUT.ORDER.COMPLETED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = body.resource?.id || body.resource?.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        try {
          await settlementService.captureSettlement(orderId);
        } catch (err) {
          console.warn("[PayPal Webhook Warning]:", err);
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

    return NextResponse.json({ success: true, eventId, eventType });
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
