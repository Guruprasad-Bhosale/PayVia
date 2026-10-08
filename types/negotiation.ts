import { AgentMessage, BuyerConstraints, MerchantConstraints } from "./agent";
import { Product } from "./product";

export type NegotiationStatus =
  | "idle"
  | "in_progress"
  | "agreement_reached"
  | "AGREED"
  | "rejected"
  | "FAILED"
  | "timed_out"
  | "user_approved"
  | "paid";

export interface NegotiationAgreement {
  id: string;
  negotiationId: string;
  productId: string;
  productName: string;
  originalPrice: number;
  finalPrice: number;
  savings: number;
  deliveryDays: number;
  buyerMaxPrice: number;
  buyerMaxDeliveryDays: number;
  merchantMinPrice: number;
  currency: string;
  status: "AGREED" | "FAILED";
  roundsCount: number;
  createdAt: string;
  userApproved: boolean;
  userApprovedAt?: string;
  termsSummary: string;
  // Backward compatibility convenience getters
  finalAgreedPrice: number;
  savingsAmount: number;
  totalSettlementAmount: number;
}

export interface NegotiationSession {
  id: string;
  product: Product;
  buyerConstraints: BuyerConstraints;
  merchantConstraints: MerchantConstraints;
  status: NegotiationStatus;
  currentRound: number;
  maxRounds: number;
  messages: AgentMessage[];
  agreement?: NegotiationAgreement;
  createdAt: string;
  updatedAt: string;
}
