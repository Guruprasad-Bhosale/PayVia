/**
 * PayVia Core Domain Types
 * Defines the multi-tenant commerce negotiation protocol data structures.
 */

export type PlatformStatus = "ACTIVE" | "SUSPENDED" | "DEVELOPMENT";
export type MerchantStatus = "ACTIVE" | "INACTIVE" | "PENDING_VERIFICATION";
export type BuyerStatus = "ACTIVE" | "BLOCKED";
export type AgentType = "BUYER" | "MERCHANT" | "PLATFORM";
export type AgentProvider = "GEMINI_3_8_FLASH" | "DETERMINISTIC_RULES" | "CUSTOM";

export type AgentCapability =
  | "NEGOTIATE_PRICE"
  | "NEGOTIATE_DELIVERY"
  | "NEGOTIATE_PAYMENT_TERMS"
  | "VIEW_CATALOG"
  | "CREATE_TRANSACTION"
  | "APPROVE_AGREEMENT";

export type PaymentTiming = "IMMEDIATE" | "NET_15" | "NET_30" | "ESCROW_DELIVERY";

export type TransactionStatus =
  | "INTENT_CREATED"
  | "NEGOTIATING"
  | "AGREED"
  | "SETTLED"
  | "FULFILLMENT_SCHEDULED"
  | "FULFILLED"
  | "CANCELLED"
  | "FAILED";

export type NegotiationStatus =
  | "DRAFT"
  | "OPEN"
  | "BUYER_PROPOSED"
  | "MERCHANT_PROPOSED"
  | "COUNTERED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "SUPERSEDED";
export type AgreementStatus = "DRAFT" | "ACCEPTED" | "USER_APPROVED" | "SETTLED" | "CANCELLED";
export type SettlementStatus = "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "CANCELLED" | "REFUNDED";
export type SettlementProviderType = "PAYPAL_ORDERS_V2" | "MOCK_SANDBOX";

export type AuditActorType = "BUYER" | "MERCHANT" | "SYSTEM" | "AGENT" | "PLATFORM";

export type AuditEventType =
  | "SHOPPING_INTENT_CREATED"
  | "CANDIDATES_DISCOVERED"
  | "OFFER_RECEIVED"
  | "OFFER_SELECTED"
  | "TRANSACTION_CREATED"
  | "NEGOTIATION_STARTED"
  | "PROPOSAL_SUBMITTED"
  | "PROPOSAL_COUNTERED"
  | "PROPOSAL_ACCEPTED"
  | "PROPOSAL_REJECTED"
  | "POLICY_VIOLATION_BLOCKED"
  | "AGREEMENT_CREATED"
  | "AGREEMENT_ACCEPTED"
  | "AGREEMENT_LOCKED"
  | "SETTLEMENT_REQUESTED"
  | "SETTLEMENT_CAPTURED"
  | "SETTLEMENT_FAILED"
  | "FULFILLMENT_SCHEDULED"
  | "FULFILLMENT_UPDATED";

/**
 * 1. Platform (Multi-Tenant Root)
 */
export interface Platform {
  id: string; // plat_xxx
  name: string;
  status: PlatformStatus;
  apiKeyHash?: string;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * 2. Merchant
 */
export interface Merchant {
  id: string; // merchant_xxx
  platformId: string;
  name: string;
  email: string;
  settlementEmail?: string;
  status: MerchantStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * 3. Buyer
 */
export interface Buyer {
  id: string; // buyer_xxx
  platformId: string;
  name: string;
  email: string;
  status: BuyerStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * 4. Agent
 */
export interface Agent {
  id: string; // agent_xxx
  platformId: string;
  type: AgentType;
  ownerType: "MERCHANT" | "BUYER" | "PLATFORM";
  ownerId: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  capabilities: AgentCapability[];
  policyVersion: number;
  provider: AgentProvider;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 5. Catalog Item
 */
export interface CatalogItem {
  id: string; // prod_xxx
  platformId: string;
  merchantId: string;
  sku?: string;
  title: string;
  description?: string;
  category?: string;
  listPrice: number;
  currency: string;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  inventoryCount?: number;
  source: "internal" | "channel3" | "demo";
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export type InventoryReservationStatus = "RESERVED" | "CONSUMED" | "RELEASED" | "EXPIRED";

export interface InventoryReservation {
  id: string; // res_xxx
  catalogItemId: string;
  merchantId: string;
  transactionId: string;
  agreementId?: string;
  quantity: number;
  status: InventoryReservationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockReservationResult {
  success: boolean;
  reservation?: InventoryReservation;
  availableStock?: number;
  error?: string;
}


/**
 * 6. Transaction Intent
 */
export interface TransactionItemIntent {
  catalogItemId: string;
  title: string;
  quantity: number;
  listPrice: number;
  currency: string;
}

export interface BuyerConstraints {
  maxTotal: number;
  maxDeliveryDays: number;
  allowedPaymentTiming?: PaymentTiming[];
}

export interface BuyerPreferences {
  paymentTiming?: PaymentTiming;
  deliveryPriority?: "HIGH" | "NORMAL" | "FLEXIBLE";
  notes?: string;
}

export interface TransactionIntent {
  platformId: string;
  buyerId: string;
  merchantId: string;
  items: TransactionItemIntent[];
  currency: string;
  constraints: BuyerConstraints;
  preferences?: BuyerPreferences;
}

/**
 * 7. Transaction Entity
 */
export interface Transaction {
  id: string; // txn_xxx
  platformId: string;
  merchantId: string;
  buyerId: string;
  status: TransactionStatus;
  currency: string;
  originalTotal: number;
  finalTotal?: number;
  savingsTotal?: number;
  intent: TransactionIntent;
  activeNegotiationId?: string;
  activeAgreementId?: string;
  activeSettlementId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * 8. Merchant Negotiation Policy (Private Floor)
 */
export interface MerchantNegotiationPolicy {
  id: string; // pol_xxx
  platformId: string;
  merchantId: string;
  catalogItemId?: string; // Optional: specific SKU policy or storewide
  enabled: boolean;
  currency: string;
  listPrice: number;
  minimumPrice: number; // STRICTLY PRIVATE: Never leaked to buyer
  minimumDeliveryDays: number;
  maximumDeliveryDays: number;
  immediateDiscountPercent?: number;
  allowedPaymentTiming: PaymentTiming[];
  strategy?: "BALANCED_ECONOMIC" | "MARGIN_PRESERVATION" | "VOLUME_VELOCITY";
  createdAt: string;
  updatedAt: string;
}

/**
 * 9. Buyer Negotiation Policy (Private Ceiling)
 */
export interface BuyerNegotiationPolicy {
  id: string; // bpol_xxx
  platformId: string;
  buyerId: string;
  currency: string;
  maxBudget: number; // STRICTLY PRIVATE: Never leaked to merchant
  maxDeliveryDays: number;
  targetDiscountPercent?: number;
  preferredPaymentTiming?: PaymentTiming;
  priority?: "PRICE_FIRST" | "DELIVERY_FIRST" | "BALANCED";
  createdAt: string;
  updatedAt: string;
}

/**
 * 10. Proposal
 */
export interface Proposal {
  id: string; // prop_xxx
  negotiationId: string;
  turnNumber: number;
  senderType: "BUYER" | "MERCHANT" | "SYSTEM";
  senderAgentId?: string;
  price: number;
  currency: string;
  deliveryDays: number;
  paymentTiming: PaymentTiming;
  savings: number;
  status: ProposalStatus;
  reasoningText?: string;
  createdAt: string;
}

/**
 * 11. Negotiation Session
 */
export interface NegotiationSession {
  id: string; // neg_xxx
  transactionId: string;
  platformId: string;
  merchantId: string;
  buyerId: string;
  status: NegotiationStatus;
  currency: string;
  roundsCount: number;
  proposals: Proposal[];
  activeProposal?: Proposal;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

/**
 * 12. Agreement (Immutable Financial Record)
 */
export interface AgreementItem {
  catalogItemId: string;
  title: string;
  quantity: number;
  listPrice: number;
  agreedPrice: number;
  currency: string;
}

export interface Agreement {
  id: string; // agr_xxx
  transactionId: string;
  negotiationId: string;
  platformId: string;
  merchantId: string;
  buyerId: string;
  currency: string;
  items: AgreementItem[];
  originalPrice: number;
  finalPrice: number;
  savings: number;
  deliveryDays: number;
  paymentTiming: PaymentTiming;
  status: AgreementStatus;
  agreementHash: string; // SHA-256 cryptographic proof of immutable terms
  createdAt: string;
  acceptedAt?: string;
  userApproved?: boolean;
  userApprovedAt?: string;
  settledAt?: string;
  expiresAt?: string;
}

/**
 * 13. Settlement
 */
export interface Settlement {
  id: string; // set_xxx
  agreementId: string;
  transactionId: string;
  platformId: string;
  provider: SettlementProviderType;
  status: SettlementStatus;
  amount: number;
  currency: string;
  externalOrderId?: string;
  externalCaptureId?: string;
  payerEmail?: string;
  payeeEmail?: string;
  receiptUrl?: string;
  createdAt: string;
  capturedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 14. Audit Event
 */
export interface AuditEvent {
  id: string; // audit_xxx
  platformId: string;
  transactionId: string;
  actorType: AuditActorType;
  actorId: string;
  eventType: AuditEventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * 15. Idempotency Record
 */
export interface IdempotencyRecord {
  key: string;
  scope: string;
  requestHash: string;
  statusCode: number;
  responseBody: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * 16. Shopping Intent (Buyer Pre-Transaction Intent)
 */
export type ShoppingIntentStatus = "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
export type OfferPriority = "PRICE" | "DELIVERY" | "BALANCED";

export interface ShoppingIntent {
  id: string; // shop_intent_xxx
  platformId: string;
  buyerId: string;
  query: string;
  constraints: {
    maxTotal: number;
    maxDeliveryDays: number;
    allowedPaymentTiming?: PaymentTiming[];
  };
  preferences?: {
    priority?: OfferPriority;
    paymentTiming?: PaymentTiming;
    notes?: string;
  };
  quantity: number;
  status: ShoppingIntentStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 17. Candidate Offer (Structured Multi-Merchant Offer in ShoppingSession)
 */
export type CandidateOfferStatus =
  | "DISCOVERED"
  | "NEGOTIATING"
  | "OFFERED"
  | "EXPIRED"
  | "SELECTED"
  | "REJECTED";

export interface CandidateOffer {
  id: string; // offer_xxx
  shoppingSessionId: string;
  platformId: string;
  merchantId: string;
  merchantName: string;
  catalogItemId: string;
  productTitle: string;
  listPrice: number;
  originalPrice?: number;
  price: number;
  currency: string;
  deliveryDays: number;
  paymentTiming: PaymentTiming;
  savings: number;
  status: CandidateOfferStatus;
  isNegotiable: boolean; // true if PayVia-enabled merchant with active policy; false if discovery-only Channel3
  negotiable?: boolean;
  source: "internal" | "channel3" | "demo";
  productUrl?: string;
  imageUrl?: string;
  score?: number; // Deterministic ranking score
  reasoningText?: string;
  negotiationId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 18. Shopping Session (Orchestrator for Buyer Discovery & Multi-Merchant Negotiations)
 */
export type ShoppingSessionStatus =
  | "CREATED"
  | "DISCOVERED"
  | "NEGOTIATING"
  | "OFFERS_READY"
  | "OFFER_SELECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface ShoppingSession {
  id: string; // shop_sess_xxx
  shoppingIntentId: string;
  platformId: string;
  buyerId: string;
  status: ShoppingSessionStatus;
  candidateOffers: CandidateOffer[];
  selectedOfferId?: string;
  transactionId?: string; // Created ONLY when an offer is selected
  createdAt: string;
  updatedAt: string;
}
