export type PaymentStatus =
  | "pending"
  | "order_created"
  | "approved"
  | "authorized"
  | "captured"
  | "failed"
  | "cancelled"
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
  approvalUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateOrderRequest {
  agreementId?: string;
  amount?: number;
  currency?: string;
  itemDescription?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  status?: string;
  approvalUrl?: string | null;
  error?: string;
  details?: string;
}

export interface CaptureOrderRequest {
  orderId: string;
  agreementId?: string;
}

export interface CaptureOrderResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  captureId?: string;
  status?: string;
  payerEmail?: string;
  error?: string;
  details?: string;
}
