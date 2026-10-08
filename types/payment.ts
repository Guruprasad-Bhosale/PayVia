export type PaymentStatus =
  | "pending"
  | "order_created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export interface PaymentTransaction {
  id: string;
  agreementId: string;
  paypalOrderId: string;
  paypalCaptureId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payerEmail?: string;
  payerName?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateOrderRequest {
  agreementId: string;
  amount: number;
  currency: string;
  itemDescription: string;
}

export interface CreateOrderResponse {
  orderId: string;
  status: string;
}

export interface CaptureOrderRequest {
  orderId: string;
  agreementId: string;
}

export interface CaptureOrderResponse {
  captureId: string;
  status: string;
  payerEmail?: string;
  transactionId?: string;
}
