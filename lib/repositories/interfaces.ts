import {
  Platform,
  Merchant,
  Buyer,
  Agent,
  CatalogItem,
  Transaction,
  MerchantNegotiationPolicy,
  BuyerNegotiationPolicy,
  NegotiationSession,
  Proposal,
  Agreement,
  Settlement,
  AuditEvent,
  IdempotencyRecord,
  ShoppingIntent,
  ShoppingSession,
} from "@/lib/domain/types";

export interface PlatformRepository {
  findById(id: string): Promise<Platform | null>;
  findByApiKeyHash(apiKeyHash: string): Promise<Platform | null>;
  create(platform: Platform): Promise<Platform>;
  update(id: string, data: Partial<Platform>): Promise<Platform>;
  list(): Promise<Platform[]>;
}

export interface MerchantRepository {
  findById(id: string): Promise<Merchant | null>;
  findByPlatformId(platformId: string): Promise<Merchant[]>;
  create(merchant: Merchant): Promise<Merchant>;
  update(id: string, data: Partial<Merchant>): Promise<Merchant>;
}

export interface BuyerRepository {
  findById(id: string): Promise<Buyer | null>;
  findByPlatformId(platformId: string): Promise<Buyer[]>;
  create(buyer: Buyer): Promise<Buyer>;
  update(id: string, data: Partial<Buyer>): Promise<Buyer>;
}

export interface AgentRepository {
  findById(id: string): Promise<Agent | null>;
  findByOwner(ownerType: "MERCHANT" | "BUYER" | "PLATFORM", ownerId: string): Promise<Agent | null>;
  create(agent: Agent): Promise<Agent>;
  update(id: string, data: Partial<Agent>): Promise<Agent>;
}

export interface CatalogRepository {
  findById(id: string): Promise<CatalogItem | null>;
  findByMerchantId(merchantId: string): Promise<CatalogItem[]>;
  search(query: string, platformId?: string): Promise<CatalogItem[]>;
  create(item: CatalogItem): Promise<CatalogItem>;
  update(id: string, data: Partial<CatalogItem>): Promise<CatalogItem>;
}

export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByPlatformId(platformId: string): Promise<Transaction[]>;
  findByMerchantId(merchantId: string): Promise<Transaction[]>;
  findByBuyerId(buyerId: string): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<Transaction>;
  update(id: string, data: Partial<Transaction>): Promise<Transaction>;
}

export interface PolicyRepository {
  findMerchantPolicy(merchantId: string, catalogItemId?: string): Promise<MerchantNegotiationPolicy | null>;
  saveMerchantPolicy(policy: MerchantNegotiationPolicy): Promise<MerchantNegotiationPolicy>;
  findBuyerPolicy(buyerId: string): Promise<BuyerNegotiationPolicy | null>;
  saveBuyerPolicy(policy: BuyerNegotiationPolicy): Promise<BuyerNegotiationPolicy>;
}

export interface NegotiationRepository {
  findById(id: string): Promise<NegotiationSession | null>;
  findByTransactionId(transactionId: string): Promise<NegotiationSession | null>;
  create(session: NegotiationSession): Promise<NegotiationSession>;
  update(id: string, data: Partial<NegotiationSession>): Promise<NegotiationSession>;
  addProposal(proposal: Proposal): Promise<Proposal>;
  getProposals(negotiationId: string): Promise<Proposal[]>;
}

export interface AgreementRepository {
  findById(id: string): Promise<Agreement | null>;
  findByTransactionId(transactionId: string): Promise<Agreement | null>;
  findByNegotiationId(negotiationId: string): Promise<Agreement | null>;
  create(agreement: Agreement): Promise<Agreement>;
  update(id: string, data: Partial<Agreement>): Promise<Agreement>;
}

export interface SettlementRepository {
  findById(id: string): Promise<Settlement | null>;
  findByAgreementId(agreementId: string): Promise<Settlement | null>;
  findByTransactionId(transactionId: string): Promise<Settlement[]>;
  findByExternalOrderId(orderId: string): Promise<Settlement | null>;
  create(settlement: Settlement): Promise<Settlement>;
  update(id: string, data: Partial<Settlement>): Promise<Settlement>;
}

export interface AuditRepository {
  append(event: AuditEvent): Promise<AuditEvent>;
  findByTransactionId(transactionId: string): Promise<AuditEvent[]>;
  findByPlatformId(platformId: string, limit?: number): Promise<AuditEvent[]>;
}

export interface IdempotencyRepository {
  get(key: string, scope: string): Promise<IdempotencyRecord | null>;
  save(record: IdempotencyRecord): Promise<void>;
}

export interface ShoppingIntentRepository {
  findById(id: string): Promise<ShoppingIntent | null>;
  findByBuyerId(buyerId: string): Promise<ShoppingIntent[]>;
  create(intent: ShoppingIntent): Promise<ShoppingIntent>;
  update(id: string, data: Partial<ShoppingIntent>): Promise<ShoppingIntent>;
}

export interface ShoppingSessionRepository {
  findById(id: string): Promise<ShoppingSession | null>;
  findByIntentId(intentId: string): Promise<ShoppingSession | null>;
  findByBuyerId(buyerId: string): Promise<ShoppingSession[]>;
  create(session: ShoppingSession): Promise<ShoppingSession>;
  update(id: string, data: Partial<ShoppingSession>): Promise<ShoppingSession>;
}

