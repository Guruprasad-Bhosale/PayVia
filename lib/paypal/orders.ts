import { paypalRequest } from "./client";
import {
  PayPalCaptureResponse,
  PayPalCreateOrderPayload,
  PayPalOrderResponse,
} from "./types";

/**
 * Creates a PayPal Orders v2 transaction for negotiated agreements.
 *
 * TODO: [PayPal Hackathon Integration] Customize purchase unit breakdowns and metadata for agent logs.
 */
export async function createPayPalOrder(params: {
  amount: number;
  currency: string;
  itemDescription: string;
  customId: string;
}): Promise<PayPalOrderResponse> {
  const payload: PayPalCreateOrderPayload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: params.customId,
        description: params.itemDescription,
        amount: {
          currency_code: params.currency,
          value: params.amount.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: "Payvia AI Commerce",
      user_action: "PAY_NOW",
    },
  };

  return paypalRequest<PayPalOrderResponse>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Captures an approved PayPal Order v2 after user authorization.
 *
 * TODO: [PayPal Hackathon Integration] Handle split settlements and merchant notifications.
 */
export async function capturePayPalOrder(
  orderId: string
): Promise<PayPalCaptureResponse> {
  return paypalRequest<PayPalCaptureResponse>(
    `/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
    }
  );
}
