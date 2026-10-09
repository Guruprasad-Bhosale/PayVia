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
  InventoryReservation,
  StockReservationResult,
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
    inventory: Map<string, number>;
    reservations: Map<string, InventoryReservation>;
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
    inventory: new Map(),
    reservations: new Map(),
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
    const item = db.catalog.get(id) || null;
    if (item && !db.inventory.has(item.id)) {
      db.inventory.set(item.id, item.inventoryCount ?? 10);
    }
    return item;
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
    if (!db.inventory.has(item.id)) {
      db.inventory.set(item.id, item.inventoryCount ?? 10);
    }
    return item;
  }
  async update(id: string, data: Partial<CatalogItem>): Promise<CatalogItem> {
    const existing = db.catalog.get(id);
    if (!existing) throw new Error(`Catalog item ${id} not found`);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    db.catalog.set(id, updated);
    if (data.inventoryCount !== undefined) {
      db.inventory.set(id, data.inventoryCount);
    }
    return updated;
  }

  _getAvailableStockSync(catalogItemId: string): number {
    const total = db.inventory.get(catalogItemId) ?? 10;
    const now = Date.now();
    let reserved = 0;
    for (const res of db.reservations.values()) {
      if (
        res.catalogItemId === catalogItemId &&
        res.status === "RESERVED" &&
        new Date(res.expiresAt).getTime() > now
      ) {
        reserved += res.quantity;
      }
    }
    return Math.max(0, total - reserved);
  }

  async getAvailableStock(catalogItemId: string): Promise<number> {
    return this._getAvailableStockSync(catalogItemId);
  }

  async setStock(catalogItemId: string, count: number): Promise<void> {
    const safeCount = Math.max(0, Math.floor(count));
    db.inventory.set(catalogItemId, safeCount);
    const item = db.catalog.get(catalogItemId);
    if (item) {
      item.inventoryCount = safeCount;
      item.stockStatus = safeCount === 0 ? "OUT_OF_STOCK" : safeCount < 3 ? "LOW_STOCK" : "IN_STOCK";
    }
  }

  async reserveStock(params: {
    catalogItemId: string;
    merchantId: string;
    transactionId: string;
    agreementId?: string;
    quantity: number;
    ttlSeconds?: number;
  }): Promise<{ success: boolean; reservation?: any; availableStock?: number; error?: string }> {
    const qty = Math.max(1, Math.floor(params.quantity || 1));
    const ttl = params.ttlSeconds || 900; // default 15 minutes TTL

    // Idempotency: check if active reservation already exists for this agreement or transaction
    for (const res of db.reservations.values()) {
      if (
        ((params.agreementId && res.agreementId === params.agreementId) ||
         res.transactionId === params.transactionId) &&
        res.status === "RESERVED" &&
        new Date(res.expiresAt).getTime() > Date.now()
      ) {
        const available = this._getAvailableStockSync(params.catalogItemId);
        return {
          success: true,
          reservation: res,
          availableStock: available,
        };
      }
    }

    // Atomic synchronous calculation and write
    const available = this._getAvailableStockSync(params.catalogItemId);
    if (available < qty) {
      return {
        success: false,
        availableStock: available,
        error: `INSUFFICIENT_INVENTORY: Requested ${qty} unit(s), but only ${available} available.`,
      };
    }

    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    const reservation = {
      id: reservationId,
      catalogItemId: params.catalogItemId,
      merchantId: params.merchantId,
      transactionId: params.transactionId,
      agreementId: params.agreementId,
      quantity: qty,
      status: "RESERVED" as const,
      expiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.reservations.set(reservationId, reservation);

    const remaining = available - qty;
    const item = db.catalog.get(params.catalogItemId);
    if (item) {
      item.stockStatus = remaining === 0 ? "OUT_OF_STOCK" : remaining < 3 ? "LOW_STOCK" : "IN_STOCK";
    }

    return {
      success: true,
      reservation,
      availableStock: remaining,
    };
  }

  async consumeReservation(reservationIdOrAgreementId: string): Promise<{ success: boolean; error?: string }> {
    let target: any = db.reservations.get(reservationIdOrAgreementId);
    if (!target) {
      for (const res of db.reservations.values()) {
        if (res.agreementId === reservationIdOrAgreementId || res.transactionId === reservationIdOrAgreementId) {
          target = res;
          break;
        }
      }
    }

    if (!target) {
      return { success: false, error: `Reservation ${reservationIdOrAgreementId} not found` };
    }

    if (target.status === "CONSUMED") {
      return { success: true }; // Idempotent
    }

    if (target.status === "RELEASED") {
      return { success: false, error: "Cannot consume an already released reservation." };
    }

    target.status = "CONSUMED";
    target.updatedAt = new Date().toISOString();

    const currentTotal = db.inventory.get(target.catalogItemId) ?? 10;
    const newTotal = Math.max(0, currentTotal - target.quantity);
    db.inventory.set(target.catalogItemId, newTotal);

    const item = db.catalog.get(target.catalogItemId);
    if (item) {
      item.inventoryCount = newTotal;
      item.stockStatus = newTotal === 0 ? "OUT_OF_STOCK" : newTotal < 3 ? "LOW_STOCK" : "IN_STOCK";
    }

    return { success: true };
  }

  async releaseReservation(reservationIdOrAgreementId: string): Promise<{ success: boolean; error?: string }> {
    let target: any = db.reservations.get(reservationIdOrAgreementId);
    if (!target) {
      for (const res of db.reservations.values()) {
        if (res.agreementId === reservationIdOrAgreementId || res.transactionId === reservationIdOrAgreementId) {
          target = res;
          break;
        }
      }
    }

    if (!target || target.status === "RELEASED") {
      return { success: true }; // Idempotent
    }

    if (target.status === "CONSUMED") {
      return { success: false, error: "Cannot release already consumed stock." };
    }

    target.status = "RELEASED";
    target.updatedAt = new Date().toISOString();

    return { success: true };
  }

  async getReservation(reservationIdOrAgreementId: string): Promise<any | null> {
    const direct = db.reservations.get(reservationIdOrAgreementId);
    if (direct) return direct;
    for (const res of db.reservations.values()) {
      if (res.agreementId === reservationIdOrAgreementId || res.transactionId === reservationIdOrAgreementId) {
        return res;
      }
    }
    return null;
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

