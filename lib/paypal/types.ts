export interface PayPalOAuthTokenResponse {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  nonce: string;
}

export interface PayPalAmount {
  currency_code: string;
  value: string;
}

export interface PayPalPurchaseUnitItem {
  name: string;
  quantity: string;
  unit_amount: PayPalAmount;
  description?: string;
  sku?: string;
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  description?: string;
  custom_id?: string;
  amount: {
    currency_code: string;
    value: string;
    breakdown?: {
      item_total?: PayPalAmount;
      shipping?: PayPalAmount;
      discount?: PayPalAmount;
    };
  };
  items?: PayPalPurchaseUnitItem[];
}

export interface PayPalCreateOrderPayload {
  intent: "CAPTURE" | "AUTHORIZE";
  purchase_units: PayPalPurchaseUnit[];
  application_context?: {
    brand_name?: string;
    landing_page?: "LOGIN" | "BILLING" | "NO_PREFERENCE";
    user_action?: "PAY_NOW" | "CONTINUE";
    return_url?: string;
    cancel_url?: string;
  };
}

export interface PayPalOrderResponse {
  id: string;
  status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED";
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: "COMPLETED" | "DECLINED" | "PARTIALLY_REFUNDED" | "PENDING" | "REFUNDED" | "FAILED";
  payer?: {
    email_address?: string;
    payer_id?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: PayPalAmount;
      }>;
    };
  }>;
}
