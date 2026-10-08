export type AgentRole = "buyer" | "merchant" | "system";

export interface BuyerConstraints {
  maxBudget: number;
  targetPrice: number;
  maxDeliveryDays: number;
  preferredPaymentMethod?: string;
  notes?: string;
}

export interface MerchantConstraints {
  originalPrice: number;
  minAcceptablePrice: number;
  shippingFloorPrice: number;
  maxRoundsAllowed: number;
}

export interface AgentMessage {
  id: string;
  sender: AgentRole;
  timestamp: string;
  content: string;
  proposedPrice?: number;
  proposedDeliveryOptionId?: string;
  reasoning?: string;
  decision?: "PROPOSE" | "COUNTER" | "ACCEPT" | "REJECT";
}

export interface AgentProfile {
  name: string;
  role: AgentRole;
  avatar: string;
  model: string;
  temperature: number;
}
