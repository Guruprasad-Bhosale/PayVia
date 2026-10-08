import { paypalRequest } from "./client";
import {
  PayPalCaptureResponse,
  PayPalCreateOrderPayload,
  PayPalOrderResponse,
} from "./types";
import { env } from "@/lib/config/env";

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  itemDescription?: string;
  merchantEmail?: string;
  customId?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CreateOrderResult {
  orderId: string;
  status: string;
  approvalUrl: string | null;
}

/**
 * Creates a PayPal Orders v2 transaction with Sandbox merchant payee.
 */
export async function createPayPalOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  const currency = params.currency || "USD";
  const amountValue = (params.amount || 1.0).toFixed(2);
  const merchantEmail = params.merchantEmail || env.paypalMerchantEmail;

  const appBase = env.appUrl || "http://localhost:3000";
  const returnUrl = params.returnUrl || `${appBase}/api/paypal/capture-order`;
  const cancelUrl = params.cancelUrl || `${appBase}/api/paypal/cancel`;

  const payload: PayPalCreateOrderPayload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: params.customId || "payvia_tx",
        description: params.itemDescription || "PayVia Sandbox Test",
        amount: {
          currency_code: currency,
          value: amountValue,
        },
        ...(merchantEmail
          ? {
              payee: {
                email_address: merchantEmail,
              },
            }
          : {}),
      },
    ],
    application_context: {
      brand_name: "PayVia",
      landing_page: "LOGIN",
      user_action: "PAY_NOW",
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  const response = await paypalRequest<PayPalOrderResponse>(
    "/v2/checkout/orders",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    }
  );

  const approvalLink = response.links?.find(
    (link) => link.rel === "approve" || link.rel === "payer-action"
  );

  return {
    orderId: response.id,
    status: response.status,
    approvalUrl: approvalLink?.href ?? null,
  };
}

/**
 * Fetches order details by ID from PayPal.
 */
export async function getPayPalOrder(
  orderId: string
): Promise<PayPalOrderResponse> {
  return paypalRequest<PayPalOrderResponse>(`/v2/checkout/orders/${orderId}`, {
    method: "GET",
  });
}

/**
 * Captures an approved PayPal Order v2 after user authorization.
 */
export async function capturePayPalOrder(
  orderId: string
): Promise<PayPalCaptureResponse> {
  return paypalRequest<PayPalCaptureResponse>(
    `/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
    }
  );
}
