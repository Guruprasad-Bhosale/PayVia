import { NextRequest, NextResponse } from "next/server";
import { assertServerEnv } from "@/lib/config/env";
import { capturePayPalOrder, getPayPalOrder } from "@/lib/paypal/orders";

export const dynamic = "force-dynamic";

/**
 * GET /api/paypal/capture-order
 * Handles the redirect return_url from PayPal when the user approves payment.
 * Extracts the order token from query parameters, captures the payment server-side,
 * and redirects the user to the verified success page.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  const baseUrl = req.nextUrl.origin || "http://localhost:3000";

  if (!token) {
    console.error("[PayPal Capture Error]: Missing token in return URL query parameters.");
    return NextResponse.redirect(`${baseUrl}/checkout?error=missing_token`);
  }

  try {
    assertServerEnv();

    // 1. Check current order state to prevent duplicate capture
    const existingOrder = await getPayPalOrder(token);

    const agreementId = existingOrder.purchase_units?.[0]?.custom_id || "";
    const agreementQuery = agreementId ? `&agreementId=${encodeURIComponent(agreementId)}` : "";

    if (existingOrder.status === "COMPLETED") {
      const existingCaptureId =
        existingOrder.purchase_units?.[0]?.payments?.captures?.[0]?.id || token;
      return NextResponse.redirect(
        `${baseUrl}/checkout/success?orderId=${token}&captureId=${existingCaptureId}&status=COMPLETED${agreementQuery}`
      );
    }

    // 2. Execute capture
    const captureResult = await capturePayPalOrder(token);

    const captureId =
      captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      captureResult.id;

    if (captureResult.status === "COMPLETED") {
      return NextResponse.redirect(
        `${baseUrl}/checkout/success?orderId=${token}&captureId=${captureId}&status=COMPLETED${agreementQuery}`
      );
    } else {
      console.warn(
        `[PayPal Capture Warning]: Order ${token} captured with non-completed status: ${captureResult.status}`
      );
      return NextResponse.redirect(
        `${baseUrl}/checkout?error=incomplete_status&status=${captureResult.status}&orderId=${token}`
      );
    }
  } catch (error) {
    console.error(`[PayPal Capture Error] Order ID ${token}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Capture processing error";
    return NextResponse.redirect(
      `${baseUrl}/checkout?error=capture_failed&orderId=${token}&details=${encodeURIComponent(
        errorMessage
      )}`
    );
  }
}

/**
 * POST /api/paypal/capture-order
 * Direct API endpoint for programmatic payment capture requests.
 */
export async function POST(req: NextRequest) {
  try {
    assertServerEnv();

    const body = await req.json();
    const orderId = body.orderId || body.token;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required orderId in request body" },
        { status: 400 }
      );
    }

    // Check current state to prevent duplicate capture
    const existingOrder = await getPayPalOrder(orderId);
    if (existingOrder.status === "COMPLETED") {
      const existingCaptureId =
        existingOrder.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId;
      return NextResponse.json({
        success: true,
        message: "Order already captured successfully.",
        orderId,
        captureId: existingCaptureId,
        status: "COMPLETED",
      });
    }

    const captureResult = await capturePayPalOrder(orderId);
    const captureId =
      captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      captureResult.id;

    return NextResponse.json({
      success: captureResult.status === "COMPLETED",
      message: "PayPal payment captured successfully.",
      orderId,
      captureId,
      status: captureResult.status,
      payerEmail: captureResult.payer?.email_address,
    });
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
