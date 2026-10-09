import {
  Transaction,
  TransactionIntent,
  NegotiationSession,
  Proposal,
  Agreement,
  Settlement,
  AuditEvent,
  Merchant,
  MerchantNegotiationPolicy,
  CatalogItem,
  ShoppingIntent,
  ShoppingSession,
  CandidateOffer,
  OfferPriority,
  PaymentTiming,
} from "@/lib/domain/types";
import { transactionService } from "@/lib/services/transaction.service";
import { negotiationService } from "@/lib/services/negotiation.service";
import { agreementService } from "@/lib/services/agreement.service";
import { settlementService } from "@/lib/services/settlement.service";
import { auditService } from "@/lib/services/audit.service";
import { policyService } from "@/lib/services/policy.service";
import { shoppingService } from "@/lib/services/shopping.service";
import { merchantRepo, catalogRepo } from "@/lib/repositories";
import { getCatalogProvider } from "@/lib/providers/catalog";
import { getMemoryProvider } from "@/lib/providers/memory";
import { MemorySearchOptions, MemorySearchResponse } from "@/lib/elastic/types";

export interface PayViaClientConfig {
  baseUrl?: string;
  apiKey?: string;
  platformId?: string;
}

export class PayViaClient {
  readonly baseUrl?: string;
  readonly apiKey?: string;
  readonly platformId: string;

  constructor(config: PayViaClientConfig = {}) {
    this.baseUrl = config.baseUrl?.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.platformId = config.platformId || "plat_default";
  }

  private get isHttpMode(): boolean {
    return Boolean(this.baseUrl && this.apiKey);
  }

  private async httpRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("PayVia HTTP client requires 'baseUrl' configuration.");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return data as T;
  }

  // 1. Platform & Merchant Management
  readonly merchants = {
    create: async (data: { name: string; email: string; settlementEmail?: string; metadata?: Record<string, unknown> }): Promise<Merchant> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ merchant: Merchant }>("/api/v1/merchants", {
          method: "POST",
          body: JSON.stringify(data),
        });
        return res.merchant;
      }
      const merchantId = `merchant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return merchantRepo.create({
        id: merchantId,
        platformId: this.platformId,
        name: data.name,
        email: data.email,
        settlementEmail: data.settlementEmail,
        status: "ACTIVE",
        metadata: data.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },

    get: async (id: string): Promise<Merchant | null> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ merchant: Merchant }>(`/api/v1/merchants/${id}`);
        return res.merchant;
      }
      return merchantRepo.findById(id);
    },

    setPolicy: async (merchantId: string, policy: Omit<MerchantNegotiationPolicy, "id" | "platformId" | "merchantId" | "createdAt" | "updatedAt">): Promise<MerchantNegotiationPolicy> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ policy: MerchantNegotiationPolicy }>(`/api/v1/merchants/${merchantId}/policy`, {
          method: "PUT",
          body: JSON.stringify(policy),
        });
        return res.policy;
      }
      return policyService.setMerchantPolicy(merchantId, {
        platformId: this.platformId,
        ...policy,
      });
    },
  };

  // 2. Catalog Management
  readonly catalog = {
    createItem: async (item: {
      merchantId: string;
      title: string;
      listPrice: number;
      currency?: string;
      description?: string;
      category?: string;
      sku?: string;
      stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
      source?: "internal" | "channel3" | "demo";
    }): Promise<CatalogItem> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ item: CatalogItem }>("/api/v1/catalog/items", {
          method: "POST",
          body: JSON.stringify(item),
        });
        return res.item;
      }
      const itemId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return catalogRepo.create({
        id: itemId,
        platformId: this.platformId,
        merchantId: item.merchantId,
        sku: item.sku,
        title: item.title,
        description: item.description,
        category: item.category,
        listPrice: item.listPrice,
        currency: item.currency || "USD",
        stockStatus: item.stockStatus || "IN_STOCK",
        source: item.source || "internal",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },

    search: async (query: string, limit: number = 10) => {
      if (this.isHttpMode) {
        return this.httpRequest<{ items: CatalogItem[]; totalCount: number }>(`/api/v1/catalog/items?q=${encodeURIComponent(query)}&limit=${limit}`);
      }
      const catalog = getCatalogProvider();
      return catalog.search(query, { limit, platformId: this.platformId });
    },
  };

  // Top-Level Convenience Methods
  async createTransaction(intent: Omit<TransactionIntent, "platformId">): Promise<Transaction> {
    return this.transactions.create(intent);
  }

  async startNegotiation(transactionId: string): Promise<NegotiationSession> {
    return this.negotiations.start(transactionId);
  }

  async runAutonomousNegotiation(transactionId: string) {
    return this.negotiations.runAutonomous(transactionId);
  }

  async settleAgreement(agreementId: string, options?: { returnUrl?: string; cancelUrl?: string }) {
    return this.settlements.create(agreementId, options);
  }

  // 3. Transactions
  readonly transactions = {
    create: async (intent: Omit<TransactionIntent, "platformId">): Promise<Transaction> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ transaction: Transaction }>("/api/v1/transactions", {
          method: "POST",
          body: JSON.stringify(intent),
        });
        return res.transaction;
      }
      return transactionService.createTransaction({
        ...intent,
        platformId: this.platformId,
      });
    },

    get: async (id: string): Promise<Transaction | null> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ transaction: Transaction }>(`/api/v1/transactions/${id}`);
        return res.transaction;
      }
      return transactionService.getTransaction(id);
    },
  };

  // 4. Negotiations
  readonly negotiations = {
    start: async (transactionId: string): Promise<NegotiationSession> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ negotiation: NegotiationSession }>(`/api/v1/transactions/${transactionId}/negotiate`, {
          method: "POST",
        });
        return res.negotiation;
      }
      return negotiationService.startNegotiation(transactionId);
    },

    runAutonomous: async (transactionId: string): Promise<{
      session: NegotiationSession;
      finalProposal?: Proposal;
      agreed: boolean;
    }> => {
      if (this.isHttpMode) {
        return this.httpRequest<{ session: NegotiationSession; finalProposal?: Proposal; agreed: boolean }>(
          `/api/v1/transactions/${transactionId}/negotiate?auto=true`,
          { method: "POST" }
        );
      }
      return negotiationService.runAutonomousNegotiation(transactionId);
    },

    submitProposal: async (
      negotiationId: string,
      proposal: {
        price: number;
        deliveryDays: number;
        senderType: "BUYER" | "MERCHANT";
        reasoningText?: string;
        paymentTiming?: "IMMEDIATE" | "NET_15" | "NET_30" | "ESCROW_DELIVERY";
      }
    ): Promise<{ proposal: Proposal; acceptedByPolicy: boolean; policyViolations?: string[] }> => {
      if (this.isHttpMode) {
        return this.httpRequest<{ proposal: Proposal; acceptedByPolicy: boolean; policyViolations?: string[] }>(
          `/api/v1/negotiations/${negotiationId}/proposals`,
          {
            method: "POST",
            body: JSON.stringify(proposal),
          }
        );
      }
      return negotiationService.submitProposal(negotiationId, proposal);
    },

    accept: async (negotiationId: string, proposalId?: string): Promise<{ agreement: Agreement; status: string }> => {
      if (this.isHttpMode) {
        return this.httpRequest<{ agreement: Agreement; status: string }>(
          `/api/v1/negotiations/${negotiationId}/accept`,
          {
            method: "POST",
            body: JSON.stringify({ proposalId }),
          }
        );
      }
      if (proposalId) {
        await negotiationService.acceptProposal(negotiationId, proposalId);
      }
      const agreement = await agreementService.createAgreementFromProposal(negotiationId, proposalId);
      return { agreement, status: "AGREED" };
    },
  };

  // 5. Agreements
  readonly agreements = {
    get: async (id: string): Promise<Agreement | null> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ agreement: Agreement }>(`/api/v1/agreements/${id}`);
        return res.agreement;
      }
      return agreementService.getAgreement(id);
    },

    approve: async (id: string): Promise<Agreement> => {
      return agreementService.approveAgreement(id);
    },
  };

  // 6. Settlements (PayPal Orders v2 Binding)
  readonly settlements = {
    create: async (
      agreementId: string,
      options?: { returnUrl?: string; cancelUrl?: string }
    ): Promise<{ settlement: Settlement; approvalUrl: string | null; agreementAmount: number }> => {
      if (this.isHttpMode) {
        return this.httpRequest<{ settlement: Settlement; approvalUrl: string | null; agreementAmount: number }>(
          `/api/v1/agreements/${agreementId}/settle`,
          {
            method: "POST",
            body: JSON.stringify(options || {}),
          }
        );
      }
      const result = await settlementService.initiateSettlement(agreementId, options);
      return {
        settlement: result.settlement,
        approvalUrl: result.approvalUrl,
        agreementAmount: result.settlement.amount,
      };
    },

    get: async (id: string): Promise<Settlement | null> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ settlement: Settlement }>(`/api/v1/settlements/${id}`);
        return res.settlement;
      }
      return settlementService.getSettlement(id);
    },

    capture: async (providerOrderId: string): Promise<Settlement> => {
      return settlementService.captureSettlement(providerOrderId);
    },
  };

  // 7. Audit Trail
  readonly audit = {
    getTrail: async (transactionId: string): Promise<AuditEvent[]> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ events: AuditEvent[] }>(`/api/v1/transactions/${transactionId}/audit`);
        return res.events;
      }
      return auditService.getTransactionAuditTrail(transactionId);
    },
  };

  // 8. Memory Layer
  readonly memory = {
    search: async (options: MemorySearchOptions): Promise<MemorySearchResponse> => {
      const memory = getMemoryProvider();
      return memory.searchMemories(options);
    },
  };

  // 9. Shopping & Autonomous Buyer Network
  readonly shopping = {
    createIntent: async (input: {
      buyerId?: string;
      query: string;
      constraints: { maxTotal: number; maxDeliveryDays: number; allowedPaymentTiming?: PaymentTiming[] };
      preferences?: { priority?: OfferPriority; paymentTiming?: PaymentTiming; notes?: string };
      quantity?: number;
    }): Promise<{ intent: ShoppingIntent; session: ShoppingSession }> => {
      if (this.isHttpMode) {
        return this.httpRequest<{ intent: ShoppingIntent; session: ShoppingSession }>(
          "/api/v1/shopping-intents",
          {
            method: "POST",
            body: JSON.stringify({ ...input, platformId: this.platformId }),
          }
        );
      }
      return shoppingService.createShoppingIntent({
        ...input,
        platformId: this.platformId,
      });
    },

    getIntent: async (id: string): Promise<ShoppingIntent | null> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ intent: ShoppingIntent }>(`/api/v1/shopping-intents/${id}`);
        return res.intent;
      }
      return shoppingService.getShoppingIntent(id);
    },

    discover: async (sessionIdOrIntentId: string): Promise<ShoppingSession> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ session: ShoppingSession }>(
          `/api/v1/shopping-intents/${sessionIdOrIntentId}/discover`,
          { method: "POST" }
        );
        return res.session;
      }
      return shoppingService.discoverCandidates(sessionIdOrIntentId);
    },

    getSession: async (id: string): Promise<ShoppingSession | null> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ session: ShoppingSession }>(`/api/v1/shopping-sessions/${id}`);
        return res.session;
      }
      return shoppingService.getShoppingSession(id);
    },

    negotiate: async (sessionId: string): Promise<ShoppingSession> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ session: ShoppingSession }>(
          `/api/v1/shopping-sessions/${sessionId}/negotiate`,
          { method: "POST" }
        );
        return res.session;
      }
      return shoppingService.negotiateOffers(sessionId);
    },

    getOffers: async (sessionId: string): Promise<CandidateOffer[]> => {
      if (this.isHttpMode) {
        const res = await this.httpRequest<{ offers: CandidateOffer[] }>(
          `/api/v1/shopping-sessions/${sessionId}/offers`
        );
        return res.offers;
      }
      const session = await shoppingService.getShoppingSession(sessionId);
      return session?.candidateOffers || [];
    },

    selectOffer: async (
      sessionId: string,
      offerId: string
    ): Promise<{ session: ShoppingSession; transaction: Transaction; agreement: Agreement }> => {
      if (this.isHttpMode) {
        return this.httpRequest<{ session: ShoppingSession; transaction: Transaction; agreement: Agreement }>(
          `/api/v1/shopping-sessions/${sessionId}/offers/${offerId}/select`,
          { method: "POST" }
        );
      }
      return shoppingService.selectOffer(sessionId, { offerId });
    },

    approve: async (sessionId: string): Promise<{ session: ShoppingSession; agreement: Agreement }> => {
      if (this.isHttpMode) {
        return this.httpRequest<{ session: ShoppingSession; agreement: Agreement }>(
          `/api/v1/shopping-sessions/${sessionId}/approve`,
          { method: "POST" }
        );
      }
      return shoppingService.approveSession(sessionId);
    },
  };
}

export function createPayViaClient(config?: PayViaClientConfig): PayViaClient {
  return new PayViaClient(config);
}

export const payvia = new PayViaClient();

