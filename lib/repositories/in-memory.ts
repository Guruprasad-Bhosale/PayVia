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
import {
  PlatformRepository,
  MerchantRepository,
  BuyerRepository,
  AgentRepository,
  CatalogRepository,
  TransactionRepository,
  PolicyRepository,
  NegotiationRepository,
  AgreementRepository,
  SettlementRepository,
  AuditRepository,
  IdempotencyRepository,
  ShoppingIntentRepository,
  ShoppingSessionRepository,
} from "./interfaces";

const globalStore = globalThis as unknown as {
  __payviaMemoryDb?: {
    platforms: Map<string, Platform>;
    merchants: Map<string, Merchant>;
    buyers: Map<string, Buyer>;
    agents: Map<string, Agent>;
    catalog: Map<string, CatalogItem>;
    transactions: Map<string, Transaction>;
    merchantPolicies: Map<string, MerchantNegotiationPolicy>;
    buyerPolicies: Map<string, BuyerNegotiationPolicy>;
    negotiations: Map<string, NegotiationSession>;
    proposals: Map<string, Proposal[]>;
    agreements: Map<string, Agreement>;
    settlements: Map<string, Settlement>;
    auditEvents: AuditEvent[];
    idempotency: Map<string, IdempotencyRecord>;
    shoppingIntents: Map<string, ShoppingIntent>;
    shoppingSessions: Map<string, ShoppingSession>;
  };
};

if (!globalStore.__payviaMemoryDb) {
  globalStore.__payviaMemoryDb = {
    platforms: new Map(),
    merchants: new Map(),
    buyers: new Map(),
    agents: new Map(),
    catalog: new Map(),
    transactions: new Map(),
    merchantPolicies: new Map(),
    buyerPolicies: new Map(),
    negotiations: new Map(),
    proposals: new Map(),
    agreements: new Map(),
    settlements: new Map(),
    auditEvents: [],
    idempotency: new Map(),
    shoppingIntents: new Map(),
    shoppingSessions: new Map(),
  };

  // Seed default demo platform and merchant
  const defaultPlat: Platform = {
    id: "plat_default",
    name: "PayVia Reference Platform",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  globalStore.__payviaMemoryDb.platforms.set(defaultPlat.id, defaultPlat);

  const defaultMerchant: Merchant = {
    id: "merchant_default",
    platformId: "plat_default",
    name: "AeroComputing Labs",
    email: "merchant@payvia.dev",
    settlementEmail: "sb-kfv47a32483863@business.example.com",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  globalStore.__payviaMemoryDb.merchants.set(defaultMerchant.id, defaultMerchant);

  const defaultBuyer: Buyer = {
    id: "buyer_default",
    platformId: "plat_default",
    name: "Demo Buyer",
    email: "buyer@payvia.dev",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  globalStore.__payviaMemoryDb.buyers.set(defaultBuyer.id, defaultBuyer);
}

const db = globalStore.__payviaMemoryDb;

export class InMemoryPlatformRepository implements PlatformRepository {
  async findById(id: string): Promise<Platform | null> {
    return db.platforms.get(id) || null;
  }
  async findByApiKeyHash(apiKeyHash: string): Promise<Platform | null> {
    for (const plat of db.platforms.values()) {
      if (plat.apiKeyHash === apiKeyHash) return plat;
    }
    return null;
  }
  async create(platform: Platform): Promise<Platform> {
    db.platforms.set(platform.id, { ...platform });
    return platform;
  }
  async update(id: string, data: Partial<Platform>): Promise<Platform> {
    const existing = db.platforms.get(id);
    if (!existing) throw new Error(`Platform ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    db.platforms.set(id, updated);
    return updated;
  }
  async list(): Promise<Platform[]> {
    return Array.from(db.platforms.values());
  }
}

export class InMemoryMerchantRepository implements MerchantRepository {
  async findById(id: string): Promise<Merchant | null> {
    return db.merchants.get(id) || null;
  }
  async findByPlatformId(platformId: string): Promise<Merchant[]> {
    return Array.from(db.merchants.values()).filter((m) => m.platformId === platformId);
  }
  async create(merchant: Merchant): Promise<Merchant> {
    db.merchants.set(merchant.id, { ...merchant });
    return merchant;
  }
  async update(id: string, data: Partial<Merchant>): Promise<Merchant> {
    const existing = db.merchants.get(id);
    if (!existing) throw new Error(`Merchant ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    db.merchants.set(id, updated);
    return updated;
  }
}

export class InMemoryBuyerRepository implements BuyerRepository {
  async findById(id: string): Promise<Buyer | null> {
    return db.buyers.get(id) || null;
  }
  async findByPlatformId(platformId: string): Promise<Buyer[]> {
    return Array.from(db.buyers.values()).filter((b) => b.platformId === platformId);
  }
  async create(buyer: Buyer): Promise<Buyer> {
    db.buyers.set(buyer.id, { ...buyer });
    return buyer;
  }
  async update(id: string, data: Partial<Buyer>): Promise<Buyer> {
    const existing = db.buyers.get(id);
    if (!existing) throw new Error(`Buyer ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    db.buyers.set(id, updated);
    return updated;
  }
}

export class InMemoryAgentRepository implements AgentRepository {
  async findById(id: string): Promise<Agent | null> {
    return db.agents.get(id) || null;
  }
  async findByOwner(ownerType: "MERCHANT" | "BUYER" | "PLATFORM", ownerId: string): Promise<Agent | null> {
    return (
      Array.from(db.agents.values()).find(
        (a) => a.ownerType === ownerType && a.ownerId === ownerId
      ) || null
    );
  }
  async create(agent: Agent): Promise<Agent> {
    db.agents.set(agent.id, { ...agent });
    return agent;
  }
  async update(id: string, data: Partial<Agent>): Promise<Agent> {
    const existing = db.agents.get(id);
    if (!existing) throw new Error(`Agent ${id} not found`);
    const updated = { ...existing, ...data };
    db.agents.set(id, updated);
    return updated;
  }
}

export class InMemoryCatalogRepository implements CatalogRepository {
  async findById(id: string): Promise<CatalogItem | null> {
    return db.catalog.get(id) || null;
  }
  async findByMerchantId(merchantId: string): Promise<CatalogItem[]> {
    return Array.from(db.catalog.values()).filter((c) => c.merchantId === merchantId);
  }
  async search(query: string, platformId?: string): Promise<CatalogItem[]> {
    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/).filter(Boolean);
    return Array.from(db.catalog.values()).filter((item) => {
      if (platformId && item.platformId !== platformId) return false;
      if (!q || q === "*") return true;
      const text = `${item.title} ${item.description || ""} ${item.category || ""}`.toLowerCase();
      return text.includes(q) || terms.some((t) => text.includes(t));
    });
  }
  async create(item: CatalogItem): Promise<CatalogItem> {
    db.catalog.set(item.id, { ...item });
    return item;
  }
  async update(id: string, data: Partial<CatalogItem>): Promise<CatalogItem> {
    const existing = db.catalog.get(id);
    if (!existing) throw new Error(`Catalog item ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    db.catalog.set(id, updated);
    return updated;
  }
}

export class InMemoryTransactionRepository implements TransactionRepository {
  async findById(id: string): Promise<Transaction | null> {
    return db.transactions.get(id) || null;
  }
  async findByPlatformId(platformId: string): Promise<Transaction[]> {
    return Array.from(db.transactions.values()).filter((t) => t.platformId === platformId);
  }
  async findByMerchantId(merchantId: string): Promise<Transaction[]> {
    return Array.from(db.transactions.values()).filter((t) => t.merchantId === merchantId);
  }
  async findByBuyerId(buyerId: string): Promise<Transaction[]> {
    return Array.from(db.transactions.values()).filter((t) => t.buyerId === buyerId);
  }
  async create(transaction: Transaction): Promise<Transaction> {
    db.transactions.set(transaction.id, { ...transaction });
    return transaction;
  }
  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const existing = db.transactions.get(id);
    if (!existing) throw new Error(`Transaction ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    db.transactions.set(id, updated);
    return updated;
  }
}

export class InMemoryPolicyRepository implements PolicyRepository {
  async findMerchantPolicy(merchantId: string, catalogItemId?: string): Promise<MerchantNegotiationPolicy | null> {
    const policies = Array.from(db.merchantPolicies.values()).filter((p) => p.merchantId === merchantId);
    if (catalogItemId) {
      const specific = policies.find((p) => p.catalogItemId === catalogItemId);
      if (specific) return specific;
    }
    const storewide = policies.find((p) => !p.catalogItemId);
    if (storewide) return storewide;
    return policies[0] || null;
  }
  async saveMerchantPolicy(policy: MerchantNegotiationPolicy): Promise<MerchantNegotiationPolicy> {
    db.merchantPolicies.set(policy.id, { ...policy });
    return policy;
  }
  async findBuyerPolicy(buyerId: string): Promise<BuyerNegotiationPolicy | null> {
    return (
      Array.from(db.buyerPolicies.values()).find((p) => p.buyerId === buyerId) || null
    );
  }
  async saveBuyerPolicy(policy: BuyerNegotiationPolicy): Promise<BuyerNegotiationPolicy> {
    db.buyerPolicies.set(policy.id, { ...policy });
    return policy;
  }
}

export class InMemoryNegotiationRepository implements NegotiationRepository {
  async findById(id: string): Promise<NegotiationSession | null> {
    const session = db.negotiations.get(id);
    if (!session) return null;
    const sessionProposals = db.proposals.get(id) || [];
    return { ...session, proposals: sessionProposals };
  }
  async findByTransactionId(transactionId: string): Promise<NegotiationSession | null> {
    const session = Array.from(db.negotiations.values()).find((n) => n.transactionId === transactionId);
    if (!session) return null;
    const sessionProposals = db.proposals.get(session.id) || [];
    return { ...session, proposals: sessionProposals };
  }
  async create(session: NegotiationSession): Promise<NegotiationSession> {
    db.negotiations.set(session.id, { ...session, proposals: session.proposals || [] });
    db.proposals.set(session.id, [...(session.proposals || [])]);
    return session;
  }
  async update(id: string, data: Partial<NegotiationSession>): Promise<NegotiationSession> {
    const existing = db.negotiations.get(id);
    if (!existing) throw new Error(`Negotiation ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    db.negotiations.set(id, updated);
    return updated;
  }
  async addProposal(proposal: Proposal): Promise<Proposal> {
    const list = db.proposals.get(proposal.negotiationId) || [];
    list.push(proposal);
    db.proposals.set(proposal.negotiationId, list);
    return proposal;
  }
  async getProposals(negotiationId: string): Promise<Proposal[]> {
    return db.proposals.get(negotiationId) || [];
  }
}

export class InMemoryAgreementRepository implements AgreementRepository {
  async findById(id: string): Promise<Agreement | null> {
    return db.agreements.get(id) || null;
  }
  async findByTransactionId(transactionId: string): Promise<Agreement | null> {
    return (
      Array.from(db.agreements.values()).find((a) => a.transactionId === transactionId) || null
    );
  }
  async findByNegotiationId(negotiationId: string): Promise<Agreement | null> {
    return (
      Array.from(db.agreements.values()).find((a) => a.negotiationId === negotiationId) || null
    );
  }
  async create(agreement: Agreement): Promise<Agreement> {
    db.agreements.set(agreement.id, { ...agreement });
    return agreement;
  }
  async update(id: string, data: Partial<Agreement>): Promise<Agreement> {
    const existing = db.agreements.get(id);
    if (!existing) throw new Error(`Agreement ${id} not found`);
    const updated = { ...existing, ...data };
    db.agreements.set(id, updated);
    return updated;
  }
}

export class InMemorySettlementRepository implements SettlementRepository {
  async findById(id: string): Promise<Settlement | null> {
    return db.settlements.get(id) || null;
  }
  async findByAgreementId(agreementId: string): Promise<Settlement | null> {
    return (
      Array.from(db.settlements.values()).find((s) => s.agreementId === agreementId) || null
    );
  }
  async findByTransactionId(transactionId: string): Promise<Settlement[]> {
    return Array.from(db.settlements.values()).filter((s) => s.transactionId === transactionId);
  }
  async findByExternalOrderId(orderId: string): Promise<Settlement | null> {
    return (
      Array.from(db.settlements.values()).find((s) => s.externalOrderId === orderId) || null
    );
  }
  async create(settlement: Settlement): Promise<Settlement> {
    db.settlements.set(settlement.id, { ...settlement });
    return settlement;
  }
  async update(id: string, data: Partial<Settlement>): Promise<Settlement> {
    const existing = db.settlements.get(id);
    if (!existing) throw new Error(`Settlement ${id} not found`);
    const updated = { ...existing, ...data };
    db.settlements.set(id, updated);
    return updated;
  }
}

export class InMemoryAuditRepository implements AuditRepository {
  async append(event: AuditEvent): Promise<AuditEvent> {
    db.auditEvents.push(event);
    return event;
  }
  async findByTransactionId(transactionId: string): Promise<AuditEvent[]> {
    return db.auditEvents.filter((e) => e.transactionId === transactionId);
  }
  async findByPlatformId(platformId: string, limit: number = 50): Promise<AuditEvent[]> {
    return db.auditEvents
      .filter((e) => e.platformId === platformId)
      .slice(-limit)
      .reverse();
  }
}

export class InMemoryIdempotencyRepository implements IdempotencyRepository {
  async get(key: string, scope: string): Promise<IdempotencyRecord | null> {
    const fullKey = `${scope}:${key}`;
    const record = db.idempotency.get(fullKey);
    if (!record) return null;
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      db.idempotency.delete(fullKey);
      return null;
    }
    return record;
  }
  async save(record: IdempotencyRecord): Promise<void> {
    const fullKey = `${record.scope}:${record.key}`;
    db.idempotency.set(fullKey, record);
  }
}

export class InMemoryShoppingIntentRepository implements ShoppingIntentRepository {
  async findById(id: string): Promise<ShoppingIntent | null> {
    return db.shoppingIntents.get(id) || null;
  }
  async findByBuyerId(buyerId: string): Promise<ShoppingIntent[]> {
    return Array.from(db.shoppingIntents.values()).filter((i) => i.buyerId === buyerId);
  }
  async create(intent: ShoppingIntent): Promise<ShoppingIntent> {
    db.shoppingIntents.set(intent.id, { ...intent });
    return intent;
  }
  async update(id: string, data: Partial<ShoppingIntent>): Promise<ShoppingIntent> {
    const existing = db.shoppingIntents.get(id);
    if (!existing) throw new Error(`ShoppingIntent ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    db.shoppingIntents.set(id, updated);
    return updated;
  }
}

export class InMemoryShoppingSessionRepository implements ShoppingSessionRepository {
  async findById(id: string): Promise<ShoppingSession | null> {
    return db.shoppingSessions.get(id) || null;
  }
  async findByIntentId(intentId: string): Promise<ShoppingSession | null> {
    return Array.from(db.shoppingSessions.values()).find((s) => s.shoppingIntentId === intentId) || null;
  }
  async findByBuyerId(buyerId: string): Promise<ShoppingSession[]> {
    return Array.from(db.shoppingSessions.values()).filter((s) => s.buyerId === buyerId);
  }
  async create(session: ShoppingSession): Promise<ShoppingSession> {
    db.shoppingSessions.set(session.id, { ...session });
    return session;
  }
  async update(id: string, data: Partial<ShoppingSession>): Promise<ShoppingSession> {
    const existing = db.shoppingSessions.get(id);
    if (!existing) throw new Error(`ShoppingSession ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    db.shoppingSessions.set(id, updated);
    return updated;
  }
}

