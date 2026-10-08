export type AgentRole = "buyer" | "merchant" | "system";
export type NegotiationAction = "PROPOSE" | "COUNTER" | "ACCEPT" | "REJECT";

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
  proposedPrice: number;
  deliveryDays: number;
  proposedDeliveryOptionId?: string;
  reasoning?: string;
  decision: NegotiationAction;
}

export interface AgentProposalOutput {
  action: NegotiationAction;
  proposedPrice: number;
  deliveryDays: number;
  message: string;
  reasoning: string;
}
