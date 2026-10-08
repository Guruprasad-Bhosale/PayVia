import { AgentMessage, BuyerConstraints, MerchantConstraints } from "./agent";
import { DeliveryOption, Product } from "./product";

export type NegotiationStatus =
  | "idle"
  | "in_progress"
  | "agreement_reached"
  | "rejected"
  | "timed_out"
  | "user_approved"
  | "paid";

export interface NegotiationAgreement {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  finalAgreedPrice: number;
  savingsAmount: number;
  selectedDelivery: DeliveryOption;
  totalSettlementAmount: number;
  currency: string;
  roundsCount: number;
  createdAt: string;
  userApproved: boolean;
  userApprovedAt?: string;
  termsSummary: string;
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
