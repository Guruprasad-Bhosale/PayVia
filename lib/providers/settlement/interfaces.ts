import { Agreement } from "@/lib/domain/types";

export interface CreatePaymentResult {
  providerOrderId: string;
  approvalUrl: string | null;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface CapturePaymentResult {
  providerCaptureId: string;
  status: string;
  amount: number;
  currency: string;
  payerEmail?: string;
  payeeEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface SettlementProvider {
  readonly providerId: string;

  /**
   * Initiates payment for an authoritative, cryptographically-sealed Agreement.
   * The provider amount is strictly derived from agreement.finalPrice.
   */
  createPayment(
    agreement: Agreement,
    options?: {
      returnUrl?: string;
      cancelUrl?: string;
    }
  ): Promise<CreatePaymentResult>;

  /**
   * Captures the authorized payment
   */
  capturePayment(providerOrderId: string): Promise<CapturePaymentResult>;

  /**
   * Retrieves payment status
   */
  getPaymentStatus(providerOrderId: string): Promise<{
    status: string;
    amount: number;
    currency: string;
  }>;
}
