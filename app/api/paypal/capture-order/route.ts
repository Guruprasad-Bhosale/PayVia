import { NextRequest, NextResponse } from "next/server";
import { assertServerEnv } from "@/lib/config/env";
import { capturePayPalOrder, getPayPalOrder } from "@/lib/paypal/orders";

export const dynamic = "force-dynamic";

/**
 * GET /api/paypal/capture-order
 * Pure read-only navigation handler for PayPal's return_url redirect.
 *
 * SAFETY INVARIANT (Requirement 6):
 * HTTP GET routes MUST NOT trigger financial mutations or capture payments.
 * This GET route extracts the PayPal order token from query parameters and safely
 * redirects the buyer to /checkout/success, where the state-changing capture
 * is performed strictly via authorized POST.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  const baseUrl = req.nextUrl.origin || "http://localhost:3000";

  if (!token) {
    console.error("[PayPal Return Error]: Missing token in return URL query parameters.");
    return NextResponse.redirect(`${baseUrl}/checkout?error=missing_token`);
  }

  try {
    assertServerEnv();

    // Pure read-only lookup of the order to resolve linked agreementId
    let agreementQuery = "";
    try {
      const existingOrder = await getPayPalOrder(token);
      const agreementId = existingOrder.purchase_units?.[0]?.custom_id || "";
      if (agreementId) {
        agreementQuery = `&agreementId=${encodeURIComponent(agreementId)}`;
      }

      // If order was already captured in a previous request, pass existing capture ID directly
      if (existingOrder.status === "COMPLETED") {
        const existingCaptureId =
          existingOrder.purchase_units?.[0]?.payments?.captures?.[0]?.id || token;
        return NextResponse.redirect(
          `${baseUrl}/checkout/success?orderId=${encodeURIComponent(token)}&captureId=${encodeURIComponent(
            existingCaptureId
          )}&status=COMPLETED${agreementQuery}`
        );
      }
    } catch (lookupErr) {
      console.warn("[PayPal Return Lookup Notice]: Non-fatal order lookup error:", lookupErr);
    }

    // Safely redirect to /checkout/success with token for authorized client POST execution
    return NextResponse.redirect(
      `${baseUrl}/checkout/success?token=${encodeURIComponent(token)}${agreementQuery}`
    );
  } catch (error) {
    console.error(`[PayPal Return Error] Order ID ${token}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Return routing error";
    return NextResponse.redirect(
      `${baseUrl}/checkout?error=routing_failed&orderId=${encodeURIComponent(token)}&details=${encodeURIComponent(
        errorMessage
      )}`
    );
  }
}

/**
 * POST /api/paypal/capture-order
 * Authoritative financial state-change endpoint for PayPal payment capture.
 * Captures the order, consumes stock reservation, marks agreement SETTLED,
 * and indexes transaction memory idempotently.
 */
export async function POST(req: NextRequest) {
  try {
    assertServerEnv();

    const body = await req.json().catch(() => ({}));
    const orderId = body.orderId || body.token;
    const providedAgreementId = body.agreementId;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId in request body" },
        { status: 400 }
      );
    }

    // 1. Check current state to enforce idempotency and prevent duplicate capture
    const existingOrder = await getPayPalOrder(orderId);
    const resolvedAgreementId =
      providedAgreementId || existingOrder.purchase_units?.[0]?.custom_id || "";

    if (existingOrder.status === "COMPLETED") {
      const existingCaptureId =
        existingOrder.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;

      return NextResponse.json({
        success: true,
        message: "Order already captured successfully.",
        orderId,
        captureId: existingCaptureId,
        status: "COMPLETED",
        agreementId: resolvedAgreementId,
        amount: existingOrder.purchase_units?.[0]?.amount?.value,
        currency: existingOrder.purchase_units?.[0]?.amount?.currency_code,
      });
    }

    // 2. Authoritative Capture Execution
    const captureResult = await capturePayPalOrder(orderId);
    const captureId =
      captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      captureResult.id;

    if (captureResult.status === "COMPLETED") {
      // 3. Consume stock reservation & mark agreement SETTLED
      if (resolvedAgreementId) {
        try {
          const { catalogRepo, agreementRepo } = await import("@/lib/repositories");
          await catalogRepo.consumeReservation(resolvedAgreementId).catch(() => {});
          await agreementRepo
            .update(resolvedAgreementId, {
              status: "SETTLED",
              settledAt: new Date().toISOString(),
            })
            .catch(() => {});
        } catch (repoErr) {
          console.warn("[PayPal Capture Warning: Repo sync]", repoErr);
        }

        // 4. Asynchronously index purchase memory into Elasticsearch Serverless
        import("@/lib/ai/negotiation-store")
          .then(({ getNegotiationAgreement }) => {
            const ag = getNegotiationAgreement(resolvedAgreementId);
            if (ag) {
              import("@/lib/elastic/indexer")
                .then(({ indexPaymentSettlement }) => {
                  indexPaymentSettlement(ag, orderId, captureId).catch(() => {});
                })
                .catch(() => {});
            }
          })
          .catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: "PayPal payment captured successfully.",
        orderId,
        captureId,
        status: "COMPLETED",
        agreementId: resolvedAgreementId,
        payerEmail: captureResult.payer?.email_address,
        amount: captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value,
        currency: captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code,
      });
    } else {
      console.warn(
        `[PayPal Capture Warning]: Order ${orderId} captured with non-completed status: ${captureResult.status}`
      );
      return NextResponse.json(
        {
          success: false,
          error: `Payment captured with unexpected status: ${captureResult.status}`,
          status: captureResult.status,
          orderId,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[PayPal POST Capture Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "PayPal capture failed",
        details: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
