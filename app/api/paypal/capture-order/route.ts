import { NextRequest, NextResponse } from "next/server";
import { captureOrderSchema } from "@/lib/validation/payment";
import { capturePayPalOrder } from "@/lib/paypal/orders";
import { isPayPalConfigured } from "@/lib/config/env";

export const dynamic = "force-dynamic";

/**
 * POST /api/paypal/capture-order
 * Captures an approved PayPal order on the server side.
 *
 * TODO: [PayPal Hackathon Integration] Connect to live Sandbox capture flow and persist transaction receipt.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = captureOrderSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid capture-order request",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { orderId } = parseResult.data;

    if (!isPayPalConfigured()) {
      return NextResponse.json(
        {
          error: "PayPal Sandbox credentials are not configured",
          message:
            "Please configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in secrets.txt or environment variables.",
          isConfigured: false,
        },
        { status: 503 }
      );
    }

    const captureResult = await capturePayPalOrder(orderId);

    return NextResponse.json({
      success: true,
      captureId: captureResult.id,
      status: captureResult.status,
      payerEmail: captureResult.payer?.email_address,
    });
  } catch (error) {
    console.error("PayPal Capture Order error:", error);
    return NextResponse.json(
      {
        error: "Failed to capture PayPal order",
        message: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
