export interface PayPalOAuthTokenResponse {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce?: string;
}

export interface PayPalAmount {
  currency_code: string;
  value: string;
  breakdown?: {
    item_total?: { currency_code: string; value: string };
    shipping?: { currency_code: string; value: string };
    discount?: { currency_code: string; value: string };
  };
}

export interface PayPalPurchaseUnitItem {
  name: string;
  quantity: string;
  unit_amount: { currency_code: string; value: string };
  description?: string;
  sku?: string;
}

export interface PayPalPayee {
  email_address?: string;
  merchant_id?: string;
}

export interface PayPalCaptureDetails {
  id: string;
  status:
    | "COMPLETED"
    | "DECLINED"
    | "PARTIALLY_REFUNDED"
    | "PENDING"
    | "REFUNDED"
    | "FAILED";
  amount?: {
    currency_code: string;
    value: string;
  };
  final_capture?: boolean;
  create_time?: string;
  update_time?: string;
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  description?: string;
  custom_id?: string;
  payee?: PayPalPayee;
  amount: PayPalAmount;
  items?: PayPalPurchaseUnitItem[];
  payments?: {
    captures?: PayPalCaptureDetails[];
  };
}

export interface PayPalApplicationContext {
  brand_name?: string;
  landing_page?: "LOGIN" | "BILLING" | "NO_PREFERENCE";
  user_action?: "PAY_NOW" | "CONTINUE";
  return_url?: string;
  cancel_url?: string;
}

export interface PayPalCreateOrderPayload {
  intent: "CAPTURE" | "AUTHORIZE";
  purchase_units: PayPalPurchaseUnit[];
  application_context?: PayPalApplicationContext;
}

export interface PayPalLinkDescription {
  href: string;
  rel: string;
  method?: string;
}

export interface PayPalOrderResponse {
  id: string;
  status:
    | "CREATED"
    | "SAVED"
    | "APPROVED"
    | "VOIDED"
    | "COMPLETED"
    | "PAYER_ACTION_REQUIRED";
  links?: PayPalLinkDescription[];
  purchase_units?: PayPalPurchaseUnit[];
  create_time?: string;
  update_time?: string;
}

export interface PayPalCaptureResponse {
  id: string;
  status:
    | "COMPLETED"
    | "DECLINED"
    | "PARTIALLY_REFUNDED"
    | "PENDING"
    | "REFUNDED"
    | "FAILED";
  payer?: {
    email_address?: string;
    payer_id?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  purchase_units?: Array<{
    reference_id?: string;
    payments?: {
      captures?: PayPalCaptureDetails[];
    };
  }>;
  links?: PayPalLinkDescription[];
}

export interface PayPalErrorDetail {
  field?: string;
  value?: string;
  location?: string;
  issue: string;
  description: string;
}

export interface PayPalApiError {
  name: string;
  message: string;
  debug_id: string;
  details?: PayPalErrorDetail[];
  links?: PayPalLinkDescription[];
}

export interface PayPalVerifyWebhookSignaturePayload {
  auth_algo: string;
  cert_url: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: Record<string, unknown>;
}

export interface PayPalVerifyWebhookSignatureResponse {
  verification_status: "SUCCESS" | "FAILURE";
}

export interface VerifyWebhookSignatureParams {
  authAlgo: string | null;
  certUrl: string | null;
  transmissionId: string | null;
  transmissionSig: string | null;
  transmissionTime: string | null;
  webhookId?: string;
  eventBody: Record<string, unknown>;
}

