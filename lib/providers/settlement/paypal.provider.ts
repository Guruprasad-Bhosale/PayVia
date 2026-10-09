import { Agreement } from "@/lib/domain/types";
import {
  SettlementProvider,
  CreatePaymentResult,
  CapturePaymentResult,
} from "./interfaces";
import { createPayPalOrder, capturePayPalOrder, getPayPalOrder } from "@/lib/paypal/orders";
import { env } from "@/lib/config/env";

export class PayPalSettlementProvider implements SettlementProvider {
  readonly providerId = "PAYPAL_ORDERS_V2";

  async createPayment(
    agreement: Agreement,
    options?: {
      returnUrl?: string;
      cancelUrl?: string;
    }
  ): Promise<CreatePaymentResult> {
    const itemDescription = agreement.items.map((i) => `${i.quantity}x ${i.title}`).join(", ");
    const appBase = env.appUrl || "http://localhost:3000";

    const returnUrl = options?.returnUrl || `${appBase}/api/paypal/capture-order`;
    const cancelUrl = options?.cancelUrl || `${appBase}/api/paypal/cancel`;

    // Strict invariant: PayPal order amount is derived 100% from authoritative agreement.finalPrice
    const orderResult = await createPayPalOrder({
      amount: agreement.finalPrice,
      currency: agreement.currency || "USD",
      itemDescription: `PayVia - ${itemDescription.slice(0, 120)}`,
      customId: agreement.id,
      returnUrl,
      cancelUrl,
    });

    return {
      providerOrderId: orderResult.orderId,
      approvalUrl: orderResult.approvalUrl,
      status: orderResult.status,
    };
  }

  async capturePayment(providerOrderId: string): Promise<CapturePaymentResult> {
    const captureResult = await capturePayPalOrder(providerOrderId);

    const captureUnit = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = captureUnit?.id || providerOrderId;
    const amount = Number(captureUnit?.amount?.value || 0);
    const currency = captureUnit?.amount?.currency_code || "USD";

    return {
      providerCaptureId: captureId,
      status: captureResult.status,
      amount,
      currency,
      payerEmail: captureResult.payer?.email_address,
      metadata: {
        rawCaptureId: captureId,
      },
    };
  }

  async getPaymentStatus(providerOrderId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
  }> {
    const order = await getPayPalOrder(providerOrderId);
    const amount = Number(order.purchase_units?.[0]?.amount?.value || 0);
    const currency = order.purchase_units?.[0]?.amount?.currency_code || "USD";

    return {
      status: order.status,
      amount,
      currency,
    };
  }
}
