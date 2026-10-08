import { NextRequest, NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validation/payment";
import { createPayPalOrder } from "@/lib/paypal/orders";
import { isPayPalConfigured } from "@/lib/config/env";

export const dynamic = "force-dynamic";

/**
 * POST /api/paypal/create-order
 * Creates a PayPal Orders v2 transaction on the server side.
 *
 * TODO: [PayPal Hackathon Integration] Connect to live Sandbox credentials from secrets.txt.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = createOrderSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid create-order request",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { agreementId, amount, currency, itemDescription } = parseResult.data;

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

    const paypalOrder = await createPayPalOrder({
      amount,
      currency,
      itemDescription,
      customId: agreementId,
    });

    return NextResponse.json({
      orderId: paypalOrder.id,
      status: paypalOrder.status,
    });
  } catch (error) {
    console.error("PayPal Create Order error:", error);
    return NextResponse.json(
      {
        error: "Failed to create PayPal order",
        message: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
