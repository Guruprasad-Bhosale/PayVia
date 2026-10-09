import { prisma } from "@/lib/db/prisma";
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
  PlatformStatus,
  MerchantStatus,
  BuyerStatus,
  AgentType,
  AgentProvider,
  TransactionStatus,
  NegotiationStatus,
  ProposalStatus,
  AgreementStatus,
  SettlementStatus,
  SettlementProviderType,
  AuditActorType,
  PaymentTiming,
  TransactionIntent,
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
import {
  InMemoryShoppingIntentRepository,
  InMemoryShoppingSessionRepository,
} from "./in-memory";

export class PrismaPlatformRepository implements PlatformRepository {
  async findById(id: string): Promise<Platform | null> {
    const p = await prisma.platform.findUnique({ where: { id } });
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      status: p.status as PlatformStatus,
      apiKeyHash: p.apiKeyHash || undefined,
      webhookUrl: p.webhookUrl || undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      metadata: (p.metadata as Record<string, unknown>) || undefined,
    };
  }

  async findByApiKeyHash(apiKeyHash: string): Promise<Platform | null> {
    const p = await prisma.platform.findFirst({ where: { apiKeyHash } });
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      status: p.status as PlatformStatus,
      apiKeyHash: p.apiKeyHash || undefined,
      webhookUrl: p.webhookUrl || undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      metadata: (p.metadata as Record<string, unknown>) || undefined,
    };
  }

  async create(platform: Platform): Promise<Platform> {
    const p = await prisma.platform.create({
      data: {
        id: platform.id,
        name: platform.name,
        status: platform.status,
        apiKeyHash: platform.apiKeyHash,
        webhookUrl: platform.webhookUrl,
        metadata: platform.metadata ? (platform.metadata as any) : undefined,
      },
    });
    return {
      id: p.id,
      name: p.name,
      status: p.status as PlatformStatus,
      apiKeyHash: p.apiKeyHash || undefined,
      webhookUrl: p.webhookUrl || undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      metadata: (p.metadata as Record<string, unknown>) || undefined,
    };
  }

  async update(id: string, data: Partial<Platform>): Promise<Platform> {
    const p = await prisma.platform.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
        ...(data.apiKeyHash && { apiKeyHash: data.apiKeyHash }),
        ...(data.webhookUrl && { webhookUrl: data.webhookUrl }),
        ...(data.metadata && { metadata: data.metadata as any }),
      },
    });
    return {
      id: p.id,
      name: p.name,
      status: p.status as PlatformStatus,
      apiKeyHash: p.apiKeyHash || undefined,
      webhookUrl: p.webhookUrl || undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      metadata: (p.metadata as Record<string, unknown>) || undefined,
    };
  }

  async list(): Promise<Platform[]> {
    const list = await prisma.platform.findMany();
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status as PlatformStatus,
      apiKeyHash: p.apiKeyHash || undefined,
      webhookUrl: p.webhookUrl || undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      metadata: (p.metadata as Record<string, unknown>) || undefined,
    }));
  }
}

export class PrismaMerchantRepository implements MerchantRepository {
  async findById(id: string): Promise<Merchant | null> {
    const m = await prisma.merchant.findUnique({ where: { id } });
    if (!m) return null;
    return {
      id: m.id,
      platformId: m.platformId,
      name: m.name,
      email: m.email,
      settlementEmail: m.settlementEmail || undefined,
      status: m.status as MerchantStatus,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      metadata: (m.metadata as Record<string, unknown>) || undefined,
    };
  }

  async findByPlatformId(platformId: string): Promise<Merchant[]> {
    const list = await prisma.merchant.findMany({ where: { platformId } });
    return list.map((m) => ({
      id: m.id,
      platformId: m.platformId,
      name: m.name,
      email: m.email,
      settlementEmail: m.settlementEmail || undefined,
      status: m.status as MerchantStatus,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      metadata: (m.metadata as Record<string, unknown>) || undefined,
    }));
  }

  async create(merchant: Merchant): Promise<Merchant> {
    const m = await prisma.merchant.create({
      data: {
        id: merchant.id,
        platformId: merchant.platformId,
        name: merchant.name,
        email: merchant.email,
        settlementEmail: merchant.settlementEmail,
        status: merchant.status,
        metadata: merchant.metadata ? (merchant.metadata as any) : undefined,
      },
    });
    return {
      id: m.id,
      platformId: m.platformId,
      name: m.name,
      email: m.email,
      settlementEmail: m.settlementEmail || undefined,
      status: m.status as MerchantStatus,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      metadata: (m.metadata as Record<string, unknown>) || undefined,
    };
  }

  async update(id: string, data: Partial<Merchant>): Promise<Merchant> {
    const m = await prisma.merchant.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.settlementEmail && { settlementEmail: data.settlementEmail }),
        ...(data.status && { status: data.status }),
        ...(data.metadata && { metadata: data.metadata as any }),
      },
    });
    return {
      id: m.id,
      platformId: m.platformId,
      name: m.name,
      email: m.email,
      settlementEmail: m.settlementEmail || undefined,
      status: m.status as MerchantStatus,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      metadata: (m.metadata as Record<string, unknown>) || undefined,
    };
  }
}

export class PrismaBuyerRepository implements BuyerRepository {
  async findById(id: string): Promise<Buyer | null> {
    const b = await prisma.buyer.findUnique({ where: { id } });
    if (!b) return null;
    return {
      id: b.id,
      platformId: b.platformId,
      name: b.name,
      email: b.email,
      status: b.status as BuyerStatus,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      metadata: (b.metadata as Record<string, unknown>) || undefined,
    };
  }

  async findByPlatformId(platformId: string): Promise<Buyer[]> {
    const list = await prisma.buyer.findMany({ where: { platformId } });
    return list.map((b) => ({
      id: b.id,
      platformId: b.platformId,
      name: b.name,
      email: b.email,
      status: b.status as BuyerStatus,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      metadata: (b.metadata as Record<string, unknown>) || undefined,
    }));
  }

  async create(buyer: Buyer): Promise<Buyer> {
    const b = await prisma.buyer.create({
      data: {
        id: buyer.id,
        platformId: buyer.platformId,
        name: buyer.name,
        email: buyer.email,
        status: buyer.status,
        metadata: buyer.metadata ? (buyer.metadata as any) : undefined,
      },
    });
    return {
      id: b.id,
      platformId: b.platformId,
      name: b.name,
      email: b.email,
      status: b.status as BuyerStatus,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      metadata: (b.metadata as Record<string, unknown>) || undefined,
    };
  }

  async update(id: string, data: Partial<Buyer>): Promise<Buyer> {
    const b = await prisma.buyer.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.status && { status: data.status }),
        ...(data.metadata && { metadata: data.metadata as any }),
      },
    });
    return {
      id: b.id,
      platformId: b.platformId,
      name: b.name,
      email: b.email,
      status: b.status as BuyerStatus,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      metadata: (b.metadata as Record<string, unknown>) || undefined,
    };
  }
}

export class PrismaAgentRepository implements AgentRepository {
  async findById(id: string): Promise<Agent | null> {
    const a = await prisma.agent.findUnique({ where: { id } });
    if (!a) return null;
    return {
      id: a.id,
      platformId: a.platformId,
      type: a.type as AgentType,
      ownerType: a.ownerType as any,
      ownerId: a.ownerId,
      name: a.name,
      status: a.status as any,
      capabilities: a.capabilities as any,
      policyVersion: a.policyVersion,
      provider: a.provider as AgentProvider,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      metadata: (a.metadata as Record<string, unknown>) || undefined,
    };
  }

  async findByOwner(ownerType: "MERCHANT" | "BUYER" | "PLATFORM", ownerId: string): Promise<Agent | null> {
    const a = await prisma.agent.findFirst({ where: { ownerType, ownerId } });
    if (!a) return null;
    return {
      id: a.id,
      platformId: a.platformId,
      type: a.type as AgentType,
      ownerType: a.ownerType as any,
      ownerId: a.ownerId,
      name: a.name,
      status: a.status as any,
      capabilities: a.capabilities as any,
      policyVersion: a.policyVersion,
      provider: a.provider as AgentProvider,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      metadata: (a.metadata as Record<string, unknown>) || undefined,
    };
  }

  async create(agent: Agent): Promise<Agent> {
    const a = await prisma.agent.create({
      data: {
        id: agent.id,
        platformId: agent.platformId,
        type: agent.type,
        ownerType: agent.ownerType,
        ownerId: agent.ownerId,
        name: agent.name,
        status: agent.status,
        capabilities: agent.capabilities,
        policyVersion: agent.policyVersion,
        provider: agent.provider,
        metadata: agent.metadata ? (agent.metadata as any) : undefined,
      },
    });
    return {
      id: a.id,
      platformId: a.platformId,
      type: a.type as AgentType,
      ownerType: a.ownerType as any,
      ownerId: a.ownerId,
      name: a.name,
      status: a.status as any,
      capabilities: a.capabilities as any,
      policyVersion: a.policyVersion,
      provider: a.provider as AgentProvider,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      metadata: (a.metadata as Record<string, unknown>) || undefined,
    };
  }

  async update(id: string, data: Partial<Agent>): Promise<Agent> {
    const a = await prisma.agent.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.capabilities && { capabilities: data.capabilities }),
        ...(data.policyVersion && { policyVersion: data.policyVersion }),
        ...(data.metadata && { metadata: data.metadata as any }),
      },
    });
    return {
      id: a.id,
      platformId: a.platformId,
      type: a.type as AgentType,
      ownerType: a.ownerType as any,
      ownerId: a.ownerId,
      name: a.name,
      status: a.status as any,
      capabilities: a.capabilities as any,
      policyVersion: a.policyVersion,
      provider: a.provider as AgentProvider,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      metadata: (a.metadata as Record<string, unknown>) || undefined,
    };
  }
}

export class PrismaCatalogRepository implements CatalogRepository {
  async findById(id: string): Promise<CatalogItem | null> {
    const c = await prisma.catalogItem.findUnique({ where: { id } });
    if (!c) return null;
    return {
      id: c.id,
      platformId: c.platformId,
      merchantId: c.merchantId,
      sku: c.sku || undefined,
      title: c.title,
      description: c.description || undefined,
      category: c.category || undefined,
      listPrice: c.listPrice,
      currency: c.currency,
      stockStatus: c.stockStatus as any,
      source: c.source as any,
      imageUrl: c.imageUrl || undefined,
      metadata: (c.metadata as Record<string, unknown>) || undefined,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  async findByMerchantId(merchantId: string): Promise<CatalogItem[]> {
    const list = await prisma.catalogItem.findMany({ where: { merchantId } });
    return list.map((c) => ({
      id: c.id,
      platformId: c.platformId,
      merchantId: c.merchantId,
      sku: c.sku || undefined,
      title: c.title,
      description: c.description || undefined,
      category: c.category || undefined,
      listPrice: c.listPrice,
      currency: c.currency,
      stockStatus: c.stockStatus as any,
      source: c.source as any,
      imageUrl: c.imageUrl || undefined,
      metadata: (c.metadata as Record<string, unknown>) || undefined,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async search(query: string, platformId?: string): Promise<CatalogItem[]> {
    const list = await prisma.catalogItem.findMany({
      where: {
        ...(platformId && { platformId }),
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });
    return list.map((c) => ({
      id: c.id,
      platformId: c.platformId,
      merchantId: c.merchantId,
      sku: c.sku || undefined,
      title: c.title,
      description: c.description || undefined,
      category: c.category || undefined,
      listPrice: c.listPrice,
      currency: c.currency,
      stockStatus: c.stockStatus as any,
      source: c.source as any,
      imageUrl: c.imageUrl || undefined,
      metadata: (c.metadata as Record<string, unknown>) || undefined,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  async create(item: CatalogItem): Promise<CatalogItem> {
    const c = await prisma.catalogItem.create({
      data: {
        id: item.id,
        platformId: item.platformId,
        merchantId: item.merchantId,
        sku: item.sku,
        title: item.title,
        description: item.description,
        category: item.category,
        listPrice: item.listPrice,
        currency: item.currency,
        stockStatus: item.stockStatus,
        source: item.source,
        imageUrl: item.imageUrl,
        metadata: item.metadata ? (item.metadata as any) : undefined,
      },
    });
    return {
      id: c.id,
      platformId: c.platformId,
      merchantId: c.merchantId,
      sku: c.sku || undefined,
      title: c.title,
      description: c.description || undefined,
      category: c.category || undefined,
      listPrice: c.listPrice,
      currency: c.currency,
      stockStatus: c.stockStatus as any,
      source: c.source as any,
      imageUrl: c.imageUrl || undefined,
      metadata: (c.metadata as Record<string, unknown>) || undefined,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  async update(id: string, data: Partial<CatalogItem>): Promise<CatalogItem> {
    const c = await prisma.catalogItem.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.listPrice !== undefined && { listPrice: data.listPrice }),
        ...(data.currency && { currency: data.currency }),
        ...(data.stockStatus && { stockStatus: data.stockStatus }),
        ...(data.imageUrl && { imageUrl: data.imageUrl }),
        ...(data.metadata && { metadata: data.metadata as any }),
      },
    });
    return {
      id: c.id,
      platformId: c.platformId,
      merchantId: c.merchantId,
      sku: c.sku || undefined,
      title: c.title,
      description: c.description || undefined,
      category: c.category || undefined,
      listPrice: c.listPrice,
      currency: c.currency,
      stockStatus: c.stockStatus as any,
      source: c.source as any,
      imageUrl: c.imageUrl || undefined,
      metadata: (c.metadata as Record<string, unknown>) || undefined,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }
}

export class PrismaTransactionRepository implements TransactionRepository {
  async findById(id: string): Promise<Transaction | null> {
    const t = await prisma.transaction.findUnique({ where: { id } });
    if (!t) return null;
    return {
      id: t.id,
      platformId: t.platformId,
      merchantId: t.merchantId,
      buyerId: t.buyerId,
      status: t.status as TransactionStatus,
      currency: t.currency,
      originalTotal: t.originalTotal,
      finalTotal: t.finalTotal || undefined,
      savingsTotal: t.savingsTotal || undefined,
      intent: t.intent as unknown as TransactionIntent,
      activeNegotiationId: t.activeNegotiationId || undefined,
      activeAgreementId: t.activeAgreementId || undefined,
      activeSettlementId: t.activeSettlementId || undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      metadata: (t.metadata as Record<string, unknown>) || undefined,
    };
  }

  async findByPlatformId(platformId: string): Promise<Transaction[]> {
    const list = await prisma.transaction.findMany({ where: { platformId } });
    return list.map((t) => ({
      id: t.id,
      platformId: t.platformId,
      merchantId: t.merchantId,
      buyerId: t.buyerId,
      status: t.status as TransactionStatus,
      currency: t.currency,
      originalTotal: t.originalTotal,
      finalTotal: t.finalTotal || undefined,
      savingsTotal: t.savingsTotal || undefined,
      intent: t.intent as unknown as TransactionIntent,
      activeNegotiationId: t.activeNegotiationId || undefined,
      activeAgreementId: t.activeAgreementId || undefined,
      activeSettlementId: t.activeSettlementId || undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      metadata: (t.metadata as Record<string, unknown>) || undefined,
    }));
  }

  async findByMerchantId(merchantId: string): Promise<Transaction[]> {
    const list = await prisma.transaction.findMany({ where: { merchantId } });
    return list.map((t) => ({
      id: t.id,
      platformId: t.platformId,
      merchantId: t.merchantId,
      buyerId: t.buyerId,
      status: t.status as TransactionStatus,
      currency: t.currency,
      originalTotal: t.originalTotal,
      finalTotal: t.finalTotal || undefined,
      savingsTotal: t.savingsTotal || undefined,
      intent: t.intent as unknown as TransactionIntent,
      activeNegotiationId: t.activeNegotiationId || undefined,
      activeAgreementId: t.activeAgreementId || undefined,
      activeSettlementId: t.activeSettlementId || undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      metadata: (t.metadata as Record<string, unknown>) || undefined,
    }));
  }

  async findByBuyerId(buyerId: string): Promise<Transaction[]> {
    const list = await prisma.transaction.findMany({ where: { buyerId } });
    return list.map((t) => ({
      id: t.id,
      platformId: t.platformId,
      merchantId: t.merchantId,
      buyerId: t.buyerId,
      status: t.status as TransactionStatus,
      currency: t.currency,
      originalTotal: t.originalTotal,
      finalTotal: t.finalTotal || undefined,
      savingsTotal: t.savingsTotal || undefined,
      intent: t.intent as unknown as TransactionIntent,
      activeNegotiationId: t.activeNegotiationId || undefined,
      activeAgreementId: t.activeAgreementId || undefined,
      activeSettlementId: t.activeSettlementId || undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      metadata: (t.metadata as Record<string, unknown>) || undefined,
    }));
  }

  async create(tx: Transaction): Promise<Transaction> {
    const t = await prisma.transaction.create({
      data: {
        id: tx.id,
        platformId: tx.platformId,
        merchantId: tx.merchantId,
        buyerId: tx.buyerId,
        status: tx.status,
        currency: tx.currency,
        originalTotal: tx.originalTotal,
        finalTotal: tx.finalTotal,
        savingsTotal: tx.savingsTotal,
        intent: tx.intent as any,
        activeNegotiationId: tx.activeNegotiationId,
        activeAgreementId: tx.activeAgreementId,
        activeSettlementId: tx.activeSettlementId,
        metadata: tx.metadata ? (tx.metadata as any) : undefined,
      },
    });
    return {
      id: t.id,
      platformId: t.platformId,
      merchantId: t.merchantId,
      buyerId: t.buyerId,
      status: t.status as TransactionStatus,
      currency: t.currency,
      originalTotal: t.originalTotal,
      finalTotal: t.finalTotal || undefined,
      savingsTotal: t.savingsTotal || undefined,
      intent: t.intent as unknown as TransactionIntent,
      activeNegotiationId: t.activeNegotiationId || undefined,
      activeAgreementId: t.activeAgreementId || undefined,
      activeSettlementId: t.activeSettlementId || undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      metadata: (t.metadata as Record<string, unknown>) || undefined,
    };
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const t = await prisma.transaction.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.finalTotal !== undefined && { finalTotal: data.finalTotal }),
        ...(data.savingsTotal !== undefined && { savingsTotal: data.savingsTotal }),
        ...(data.activeNegotiationId && { activeNegotiationId: data.activeNegotiationId }),
        ...(data.activeAgreementId && { activeAgreementId: data.activeAgreementId }),
        ...(data.activeSettlementId && { activeSettlementId: data.activeSettlementId }),
        ...(data.metadata && { metadata: data.metadata as any }),
      },
    });
    return {
      id: t.id,
      platformId: t.platformId,
      merchantId: t.merchantId,
      buyerId: t.buyerId,
      status: t.status as TransactionStatus,
      currency: t.currency,
      originalTotal: t.originalTotal,
      finalTotal: t.finalTotal || undefined,
      savingsTotal: t.savingsTotal || undefined,
      intent: t.intent as unknown as TransactionIntent,
      activeNegotiationId: t.activeNegotiationId || undefined,
      activeAgreementId: t.activeAgreementId || undefined,
      activeSettlementId: t.activeSettlementId || undefined,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      metadata: (t.metadata as Record<string, unknown>) || undefined,
    };
  }
}

export class PrismaPolicyRepository implements PolicyRepository {
  async findMerchantPolicy(merchantId: string, catalogItemId?: string): Promise<MerchantNegotiationPolicy | null> {
    let p = catalogItemId
      ? await prisma.merchantPolicy.findFirst({
          where: { merchantId, catalogItemId },
        })
      : null;

    if (!p) {
      p = await prisma.merchantPolicy.findFirst({
        where: { merchantId, catalogItemId: null },
      });
    }

    if (!p) {
      p = await prisma.merchantPolicy.findFirst({
        where: { merchantId },
      });
    }

    if (!p) return null;
    return {
      id: p.id,
      platformId: p.platformId,
      merchantId: p.merchantId,
      catalogItemId: p.catalogItemId || undefined,
      enabled: p.enabled,
      currency: p.currency,
      listPrice: p.listPrice,
      minimumPrice: p.minimumPrice,
      minimumDeliveryDays: p.minimumDeliveryDays,
      maximumDeliveryDays: p.maximumDeliveryDays,
      immediateDiscountPercent: p.immediateDiscountPercent || undefined,
      allowedPaymentTiming: p.allowedPaymentTiming as any,
      strategy: p.strategy as any,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async saveMerchantPolicy(policy: MerchantNegotiationPolicy): Promise<MerchantNegotiationPolicy> {
    const p = await prisma.merchantPolicy.upsert({
      where: { id: policy.id },
      create: {
        id: policy.id,
        platformId: policy.platformId,
        merchantId: policy.merchantId,
        catalogItemId: policy.catalogItemId,
        enabled: policy.enabled,
        currency: policy.currency,
        listPrice: policy.listPrice,
        minimumPrice: policy.minimumPrice,
        minimumDeliveryDays: policy.minimumDeliveryDays,
        maximumDeliveryDays: policy.maximumDeliveryDays,
        immediateDiscountPercent: policy.immediateDiscountPercent,
        allowedPaymentTiming: policy.allowedPaymentTiming,
        strategy: policy.strategy || "BALANCED_ECONOMIC",
      },
      update: {
        enabled: policy.enabled,
        currency: policy.currency,
        listPrice: policy.listPrice,
        minimumPrice: policy.minimumPrice,
        minimumDeliveryDays: policy.minimumDeliveryDays,
        maximumDeliveryDays: policy.maximumDeliveryDays,
        immediateDiscountPercent: policy.immediateDiscountPercent,
        allowedPaymentTiming: policy.allowedPaymentTiming,
        strategy: policy.strategy || "BALANCED_ECONOMIC",
      },
    });
    return {
      id: p.id,
      platformId: p.platformId,
      merchantId: p.merchantId,
      catalogItemId: p.catalogItemId || undefined,
      enabled: p.enabled,
      currency: p.currency,
      listPrice: p.listPrice,
      minimumPrice: p.minimumPrice,
      minimumDeliveryDays: p.minimumDeliveryDays,
      maximumDeliveryDays: p.maximumDeliveryDays,
      immediateDiscountPercent: p.immediateDiscountPercent || undefined,
      allowedPaymentTiming: p.allowedPaymentTiming as any,
      strategy: p.strategy as any,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async findBuyerPolicy(buyerId: string): Promise<BuyerNegotiationPolicy | null> {
    const p = await prisma.buyerPolicy.findFirst({ where: { buyerId } });
    if (!p) return null;
    return {
      id: p.id,
      platformId: p.platformId,
      buyerId: p.buyerId,
      currency: p.currency,
      maxBudget: p.maxBudget,
      maxDeliveryDays: p.maxDeliveryDays,
      targetDiscountPercent: p.targetDiscountPercent || undefined,
      preferredPaymentTiming: (p.preferredPaymentTiming as PaymentTiming) || undefined,
      priority: p.priority as any,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }

  async saveBuyerPolicy(policy: BuyerNegotiationPolicy): Promise<BuyerNegotiationPolicy> {
    const p = await prisma.buyerPolicy.upsert({
      where: { id: policy.id },
      create: {
        id: policy.id,
        platformId: policy.platformId,
        buyerId: policy.buyerId,
        currency: policy.currency,
        maxBudget: policy.maxBudget,
        maxDeliveryDays: policy.maxDeliveryDays,
        targetDiscountPercent: policy.targetDiscountPercent,
        preferredPaymentTiming: policy.preferredPaymentTiming,
        priority: policy.priority,
      },
      update: {
        currency: policy.currency,
        maxBudget: policy.maxBudget,
        maxDeliveryDays: policy.maxDeliveryDays,
        targetDiscountPercent: policy.targetDiscountPercent,
        preferredPaymentTiming: policy.preferredPaymentTiming,
        priority: policy.priority,
      },
    });
    return {
      id: p.id,
      platformId: p.platformId,
      buyerId: p.buyerId,
      currency: p.currency,
      maxBudget: p.maxBudget,
      maxDeliveryDays: p.maxDeliveryDays,
      targetDiscountPercent: p.targetDiscountPercent || undefined,
      preferredPaymentTiming: (p.preferredPaymentTiming as PaymentTiming) || undefined,
      priority: p.priority as any,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  }
}

export class PrismaNegotiationRepository implements NegotiationRepository {
  async findById(id: string): Promise<NegotiationSession | null> {
    const n = await prisma.negotiationSession.findUnique({
      where: { id },
      include: { proposals: true },
    });
    if (!n) return null;
    const proposals: Proposal[] = n.proposals.map((pr) => ({
      id: pr.id,
      negotiationId: pr.negotiationId,
      turnNumber: pr.turnNumber,
      senderType: pr.senderType as any,
      senderAgentId: pr.senderAgentId || undefined,
      price: pr.price,
      currency: pr.currency,
      deliveryDays: pr.deliveryDays,
      paymentTiming: pr.paymentTiming as any,
      savings: pr.savings,
      status: pr.status as ProposalStatus,
      reasoningText: pr.reasoningText || undefined,
      createdAt: pr.createdAt.toISOString(),
    }));
    return {
      id: n.id,
      transactionId: n.transactionId,
      platformId: n.platformId,
      merchantId: n.merchantId,
      buyerId: n.buyerId,
      status: n.status as NegotiationStatus,
      currency: n.currency,
      roundsCount: n.roundsCount,
      proposals,
      activeProposal: proposals.length > 0 ? proposals[proposals.length - 1] : undefined,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      expiresAt: n.expiresAt ? n.expiresAt.toISOString() : undefined,
    };
  }

  async findByTransactionId(transactionId: string): Promise<NegotiationSession | null> {
    const n = await prisma.negotiationSession.findFirst({
      where: { transactionId },
      include: { proposals: true },
    });
    if (!n) return null;
    const proposals: Proposal[] = n.proposals.map((pr) => ({
      id: pr.id,
      negotiationId: pr.negotiationId,
      turnNumber: pr.turnNumber,
      senderType: pr.senderType as any,
      senderAgentId: pr.senderAgentId || undefined,
      price: pr.price,
      currency: pr.currency,
      deliveryDays: pr.deliveryDays,
      paymentTiming: pr.paymentTiming as any,
      savings: pr.savings,
      status: pr.status as ProposalStatus,
      reasoningText: pr.reasoningText || undefined,
      createdAt: pr.createdAt.toISOString(),
    }));
    return {
      id: n.id,
      transactionId: n.transactionId,
      platformId: n.platformId,
      merchantId: n.merchantId,
      buyerId: n.buyerId,
      status: n.status as NegotiationStatus,
      currency: n.currency,
      roundsCount: n.roundsCount,
      proposals,
      activeProposal: proposals.length > 0 ? proposals[proposals.length - 1] : undefined,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      expiresAt: n.expiresAt ? n.expiresAt.toISOString() : undefined,
    };
  }

  async create(session: NegotiationSession): Promise<NegotiationSession> {
    const n = await prisma.negotiationSession.create({
      data: {
        id: session.id,
        transactionId: session.transactionId,
        platformId: session.platformId,
        merchantId: session.merchantId,
        buyerId: session.buyerId,
        status: session.status,
        currency: session.currency,
        roundsCount: session.roundsCount,
        expiresAt: session.expiresAt ? new Date(session.expiresAt) : undefined,
      },
    });
    return {
      id: n.id,
      transactionId: n.transactionId,
      platformId: n.platformId,
      merchantId: n.merchantId,
      buyerId: n.buyerId,
      status: n.status as NegotiationStatus,
      currency: n.currency,
      roundsCount: n.roundsCount,
      proposals: [],
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      expiresAt: n.expiresAt ? n.expiresAt.toISOString() : undefined,
    };
  }

  async update(id: string, data: Partial<NegotiationSession>): Promise<NegotiationSession> {
    const n = await prisma.negotiationSession.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.roundsCount !== undefined && { roundsCount: data.roundsCount }),
        ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) }),
      },
      include: { proposals: true },
    });
    const proposals: Proposal[] = n.proposals.map((pr) => ({
      id: pr.id,
      negotiationId: pr.negotiationId,
      turnNumber: pr.turnNumber,
      senderType: pr.senderType as any,
      senderAgentId: pr.senderAgentId || undefined,
      price: pr.price,
      currency: pr.currency,
      deliveryDays: pr.deliveryDays,
      paymentTiming: pr.paymentTiming as any,
      savings: pr.savings,
      status: pr.status as ProposalStatus,
      reasoningText: pr.reasoningText || undefined,
      createdAt: pr.createdAt.toISOString(),
    }));
    return {
      id: n.id,
      transactionId: n.transactionId,
      platformId: n.platformId,
      merchantId: n.merchantId,
      buyerId: n.buyerId,
      status: n.status as NegotiationStatus,
      currency: n.currency,
      roundsCount: n.roundsCount,
      proposals,
      activeProposal: proposals.length > 0 ? proposals[proposals.length - 1] : undefined,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
      expiresAt: n.expiresAt ? n.expiresAt.toISOString() : undefined,
    };
  }

  async addProposal(proposal: Proposal): Promise<Proposal> {
    const p = await prisma.proposal.create({
      data: {
        id: proposal.id,
        negotiationId: proposal.negotiationId,
        turnNumber: proposal.turnNumber,
        senderType: proposal.senderType,
        senderAgentId: proposal.senderAgentId,
        price: proposal.price,
        currency: proposal.currency,
        deliveryDays: proposal.deliveryDays,
        paymentTiming: proposal.paymentTiming,
        savings: proposal.savings,
        status: proposal.status,
        reasoningText: proposal.reasoningText,
      },
    });
    return {
      id: p.id,
      negotiationId: p.negotiationId,
      turnNumber: p.turnNumber,
      senderType: p.senderType as any,
      senderAgentId: p.senderAgentId || undefined,
      price: p.price,
      currency: p.currency,
      deliveryDays: p.deliveryDays,
      paymentTiming: p.paymentTiming as any,
      savings: p.savings,
      status: p.status as ProposalStatus,
      reasoningText: p.reasoningText || undefined,
      createdAt: p.createdAt.toISOString(),
    };
  }

  async getProposals(negotiationId: string): Promise<Proposal[]> {
    const list = await prisma.proposal.findMany({
      where: { negotiationId },
      orderBy: { turnNumber: "asc" },
    });
    return list.map((p) => ({
      id: p.id,
      negotiationId: p.negotiationId,
      turnNumber: p.turnNumber,
      senderType: p.senderType as any,
      senderAgentId: p.senderAgentId || undefined,
      price: p.price,
      currency: p.currency,
      deliveryDays: p.deliveryDays,
      paymentTiming: p.paymentTiming as any,
      savings: p.savings,
      status: p.status as ProposalStatus,
      reasoningText: p.reasoningText || undefined,
      createdAt: p.createdAt.toISOString(),
    }));
  }
}

export class PrismaAgreementRepository implements AgreementRepository {
  async findById(id: string): Promise<Agreement | null> {
    const a = await prisma.agreement.findUnique({ where: { id } });
    if (!a) return null;
    return {
      id: a.id,
      transactionId: a.transactionId,
      negotiationId: a.negotiationId,
      platformId: a.platformId,
      merchantId: a.merchantId,
      buyerId: a.buyerId,
      currency: a.currency,
      items: a.items as any,
      originalPrice: a.originalPrice,
      finalPrice: a.finalPrice,
      savings: a.savings,
      deliveryDays: a.deliveryDays,
      paymentTiming: a.paymentTiming as any,
      status: a.status as AgreementStatus,
      agreementHash: a.agreementHash,
      createdAt: a.createdAt.toISOString(),
      acceptedAt: a.acceptedAt ? a.acceptedAt.toISOString() : undefined,
      userApprovedAt: a.userApprovedAt ? a.userApprovedAt.toISOString() : undefined,
      settledAt: a.settledAt ? a.settledAt.toISOString() : undefined,
      expiresAt: a.expiresAt ? a.expiresAt.toISOString() : undefined,
    };
  }

  async findByTransactionId(transactionId: string): Promise<Agreement | null> {
    const a = await prisma.agreement.findFirst({ where: { transactionId } });
    if (!a) return null;
    return {
      id: a.id,
      transactionId: a.transactionId,
      negotiationId: a.negotiationId,
      platformId: a.platformId,
      merchantId: a.merchantId,
      buyerId: a.buyerId,
      currency: a.currency,
      items: a.items as any,
      originalPrice: a.originalPrice,
      finalPrice: a.finalPrice,
      savings: a.savings,
      deliveryDays: a.deliveryDays,
      paymentTiming: a.paymentTiming as any,
      status: a.status as AgreementStatus,
      agreementHash: a.agreementHash,
      createdAt: a.createdAt.toISOString(),
      acceptedAt: a.acceptedAt ? a.acceptedAt.toISOString() : undefined,
      userApprovedAt: a.userApprovedAt ? a.userApprovedAt.toISOString() : undefined,
      settledAt: a.settledAt ? a.settledAt.toISOString() : undefined,
      expiresAt: a.expiresAt ? a.expiresAt.toISOString() : undefined,
    };
  }

  async findByNegotiationId(negotiationId: string): Promise<Agreement | null> {
    const a = await prisma.agreement.findFirst({ where: { negotiationId } });
    if (!a) return null;
    return {
      id: a.id,
      transactionId: a.transactionId,
      negotiationId: a.negotiationId,
      platformId: a.platformId,
      merchantId: a.merchantId,
      buyerId: a.buyerId,
      currency: a.currency,
      items: a.items as any,
      originalPrice: a.originalPrice,
      finalPrice: a.finalPrice,
      savings: a.savings,
      deliveryDays: a.deliveryDays,
      paymentTiming: a.paymentTiming as any,
      status: a.status as AgreementStatus,
      agreementHash: a.agreementHash,
      createdAt: a.createdAt.toISOString(),
      acceptedAt: a.acceptedAt ? a.acceptedAt.toISOString() : undefined,
      userApprovedAt: a.userApprovedAt ? a.userApprovedAt.toISOString() : undefined,
      settledAt: a.settledAt ? a.settledAt.toISOString() : undefined,
      expiresAt: a.expiresAt ? a.expiresAt.toISOString() : undefined,
    };
  }

  async create(agreement: Agreement): Promise<Agreement> {
    const a = await prisma.agreement.create({
      data: {
        id: agreement.id,
        transactionId: agreement.transactionId,
        negotiationId: agreement.negotiationId,
        platformId: agreement.platformId,
        merchantId: agreement.merchantId,
        buyerId: agreement.buyerId,
        currency: agreement.currency,
        items: agreement.items as any,
        originalPrice: agreement.originalPrice,
        finalPrice: agreement.finalPrice,
        savings: agreement.savings,
        deliveryDays: agreement.deliveryDays,
        paymentTiming: agreement.paymentTiming,
        status: agreement.status,
        agreementHash: agreement.agreementHash,
        acceptedAt: agreement.acceptedAt ? new Date(agreement.acceptedAt) : undefined,
        userApprovedAt: agreement.userApprovedAt ? new Date(agreement.userApprovedAt) : undefined,
        settledAt: agreement.settledAt ? new Date(agreement.settledAt) : undefined,
        expiresAt: agreement.expiresAt ? new Date(agreement.expiresAt) : undefined,
      },
    });
    return {
      id: a.id,
      transactionId: a.transactionId,
      negotiationId: a.negotiationId,
      platformId: a.platformId,
      merchantId: a.merchantId,
      buyerId: a.buyerId,
      currency: a.currency,
      items: a.items as any,
      originalPrice: a.originalPrice,
      finalPrice: a.finalPrice,
      savings: a.savings,
      deliveryDays: a.deliveryDays,
      paymentTiming: a.paymentTiming as any,
      status: a.status as AgreementStatus,
      agreementHash: a.agreementHash,
      createdAt: a.createdAt.toISOString(),
      acceptedAt: a.acceptedAt ? a.acceptedAt.toISOString() : undefined,
      userApprovedAt: a.userApprovedAt ? a.userApprovedAt.toISOString() : undefined,
      settledAt: a.settledAt ? a.settledAt.toISOString() : undefined,
      expiresAt: a.expiresAt ? a.expiresAt.toISOString() : undefined,
    };
  }

  async update(id: string, data: Partial<Agreement>): Promise<Agreement> {
    const a = await prisma.agreement.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.acceptedAt && { acceptedAt: new Date(data.acceptedAt) }),
        ...(data.userApprovedAt && { userApprovedAt: new Date(data.userApprovedAt) }),
        ...(data.settledAt && { settledAt: new Date(data.settledAt) }),
      },
    });
    return {
      id: a.id,
      transactionId: a.transactionId,
      negotiationId: a.negotiationId,
      platformId: a.platformId,
      merchantId: a.merchantId,
      buyerId: a.buyerId,
      currency: a.currency,
      items: a.items as any,
      originalPrice: a.originalPrice,
      finalPrice: a.finalPrice,
      savings: a.savings,
      deliveryDays: a.deliveryDays,
      paymentTiming: a.paymentTiming as any,
      status: a.status as AgreementStatus,
      agreementHash: a.agreementHash,
      createdAt: a.createdAt.toISOString(),
      acceptedAt: a.acceptedAt ? a.acceptedAt.toISOString() : undefined,
      userApprovedAt: a.userApprovedAt ? a.userApprovedAt.toISOString() : undefined,
      settledAt: a.settledAt ? a.settledAt.toISOString() : undefined,
      expiresAt: a.expiresAt ? a.expiresAt.toISOString() : undefined,
    };
  }
}

export class PrismaSettlementRepository implements SettlementRepository {
  async findById(id: string): Promise<Settlement | null> {
    const s = await prisma.settlement.findUnique({ where: { id } });
    if (!s) return null;
    return {
      id: s.id,
      agreementId: s.agreementId,
      transactionId: s.transactionId,
      platformId: s.platformId,
      provider: s.provider as SettlementProviderType,
      status: s.status as SettlementStatus,
      amount: s.amount,
      currency: s.currency,
      externalOrderId: s.externalOrderId || undefined,
      externalCaptureId: s.externalCaptureId || undefined,
      payerEmail: s.payerEmail || undefined,
      payeeEmail: s.payeeEmail || undefined,
      receiptUrl: s.receiptUrl || undefined,
      metadata: (s.metadata as Record<string, unknown>) || undefined,
      createdAt: s.createdAt.toISOString(),
      capturedAt: s.capturedAt ? s.capturedAt.toISOString() : undefined,
    };
  }

  async findByAgreementId(agreementId: string): Promise<Settlement | null> {
    const s = await prisma.settlement.findFirst({ where: { agreementId } });
    if (!s) return null;
    return {
      id: s.id,
      agreementId: s.agreementId,
      transactionId: s.transactionId,
      platformId: s.platformId,
      provider: s.provider as SettlementProviderType,
      status: s.status as SettlementStatus,
      amount: s.amount,
      currency: s.currency,
      externalOrderId: s.externalOrderId || undefined,
      externalCaptureId: s.externalCaptureId || undefined,
      payerEmail: s.payerEmail || undefined,
      payeeEmail: s.payeeEmail || undefined,
      receiptUrl: s.receiptUrl || undefined,
      metadata: (s.metadata as Record<string, unknown>) || undefined,
      createdAt: s.createdAt.toISOString(),
      capturedAt: s.capturedAt ? s.capturedAt.toISOString() : undefined,
    };
  }

  async findByTransactionId(transactionId: string): Promise<Settlement[]> {
    const list = await prisma.settlement.findMany({ where: { transactionId } });
    return list.map((s) => ({
      id: s.id,
      agreementId: s.agreementId,
      transactionId: s.transactionId,
      platformId: s.platformId,
      provider: s.provider as SettlementProviderType,
      status: s.status as SettlementStatus,
      amount: s.amount,
      currency: s.currency,
      externalOrderId: s.externalOrderId || undefined,
      externalCaptureId: s.externalCaptureId || undefined,
      payerEmail: s.payerEmail || undefined,
      payeeEmail: s.payeeEmail || undefined,
      receiptUrl: s.receiptUrl || undefined,
      metadata: (s.metadata as Record<string, unknown>) || undefined,
      createdAt: s.createdAt.toISOString(),
      capturedAt: s.capturedAt ? s.capturedAt.toISOString() : undefined,
    }));
  }

  async findByExternalOrderId(orderId: string): Promise<Settlement | null> {
    const s = await prisma.settlement.findFirst({ where: { externalOrderId: orderId } });
    if (!s) return null;
    return {
      id: s.id,
      agreementId: s.agreementId,
      transactionId: s.transactionId,
      platformId: s.platformId,
      provider: s.provider as SettlementProviderType,
      status: s.status as SettlementStatus,
      amount: s.amount,
      currency: s.currency,
      externalOrderId: s.externalOrderId || undefined,
      externalCaptureId: s.externalCaptureId || undefined,
      payerEmail: s.payerEmail || undefined,
      payeeEmail: s.payeeEmail || undefined,
      receiptUrl: s.receiptUrl || undefined,
      metadata: (s.metadata as Record<string, unknown>) || undefined,
      createdAt: s.createdAt.toISOString(),
      capturedAt: s.capturedAt ? s.capturedAt.toISOString() : undefined,
    };
  }

  async create(settlement: Settlement): Promise<Settlement> {
    const s = await prisma.settlement.create({
      data: {
        id: settlement.id,
        agreementId: settlement.agreementId,
        transactionId: settlement.transactionId,
        platformId: settlement.platformId,
        provider: settlement.provider,
        status: settlement.status,
        amount: settlement.amount,
        currency: settlement.currency,
        externalOrderId: settlement.externalOrderId,
        externalCaptureId: settlement.externalCaptureId,
        payerEmail: settlement.payerEmail,
        payeeEmail: settlement.payeeEmail,
        receiptUrl: settlement.receiptUrl,
        metadata: settlement.metadata ? (settlement.metadata as any) : undefined,
      },
    });
    return {
      id: s.id,
      agreementId: s.agreementId,
      transactionId: s.transactionId,
      platformId: s.platformId,
      provider: s.provider as SettlementProviderType,
      status: s.status as SettlementStatus,
      amount: s.amount,
      currency: s.currency,
      externalOrderId: s.externalOrderId || undefined,
      externalCaptureId: s.externalCaptureId || undefined,
      payerEmail: s.payerEmail || undefined,
      payeeEmail: s.payeeEmail || undefined,
      receiptUrl: s.receiptUrl || undefined,
      metadata: (s.metadata as Record<string, unknown>) || undefined,
      createdAt: s.createdAt.toISOString(),
      capturedAt: s.capturedAt ? s.capturedAt.toISOString() : undefined,
    };
  }

  async update(id: string, data: Partial<Settlement>): Promise<Settlement> {
    const s = await prisma.settlement.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.externalOrderId && { externalOrderId: data.externalOrderId }),
        ...(data.externalCaptureId && { externalCaptureId: data.externalCaptureId }),
        ...(data.payerEmail && { payerEmail: data.payerEmail }),
        ...(data.payeeEmail && { payeeEmail: data.payeeEmail }),
        ...(data.receiptUrl && { receiptUrl: data.receiptUrl }),
        ...(data.capturedAt && { capturedAt: new Date(data.capturedAt) }),
        ...(data.metadata && { metadata: data.metadata as any }),
      },
    });
    return {
      id: s.id,
      agreementId: s.agreementId,
      transactionId: s.transactionId,
      platformId: s.platformId,
      provider: s.provider as SettlementProviderType,
      status: s.status as SettlementStatus,
      amount: s.amount,
      currency: s.currency,
      externalOrderId: s.externalOrderId || undefined,
      externalCaptureId: s.externalCaptureId || undefined,
      payerEmail: s.payerEmail || undefined,
      payeeEmail: s.payeeEmail || undefined,
      receiptUrl: s.receiptUrl || undefined,
      metadata: (s.metadata as Record<string, unknown>) || undefined,
      createdAt: s.createdAt.toISOString(),
      capturedAt: s.capturedAt ? s.capturedAt.toISOString() : undefined,
    };
  }
}

export class PrismaAuditRepository implements AuditRepository {
  async append(event: AuditEvent): Promise<AuditEvent> {
    const a = await prisma.auditEvent.create({
      data: {
        id: event.id,
        platformId: event.platformId,
        transactionId: event.transactionId,
        actorType: event.actorType as AuditActorType,
        actorId: event.actorId,
        eventType: event.eventType as any,
        metadata: event.metadata ? (event.metadata as any) : undefined,
        timestamp: new Date(event.timestamp),
      },
    });
    return {
      id: a.id,
      platformId: a.platformId,
      transactionId: a.transactionId,
      actorType: a.actorType as any,
      actorId: a.actorId,
      eventType: a.eventType as any,
      metadata: (a.metadata as Record<string, unknown>) || undefined,
      timestamp: a.timestamp.toISOString(),
    };
  }

  async findByTransactionId(transactionId: string): Promise<AuditEvent[]> {
    const list = await prisma.auditEvent.findMany({
      where: { transactionId },
      orderBy: { timestamp: "asc" },
    });
    return list.map((a) => ({
      id: a.id,
      platformId: a.platformId,
      transactionId: a.transactionId,
      actorType: a.actorType as any,
      actorId: a.actorId,
      eventType: a.eventType as any,
      metadata: (a.metadata as Record<string, unknown>) || undefined,
      timestamp: a.timestamp.toISOString(),
    }));
  }

  async findByPlatformId(platformId: string, limit: number = 100): Promise<AuditEvent[]> {
    const list = await prisma.auditEvent.findMany({
      where: { platformId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
    return list.map((a) => ({
      id: a.id,
      platformId: a.platformId,
      transactionId: a.transactionId,
      actorType: a.actorType as any,
      actorId: a.actorId,
      eventType: a.eventType as any,
      metadata: (a.metadata as Record<string, unknown>) || undefined,
      timestamp: a.timestamp.toISOString(),
    }));
  }
}

export class PrismaIdempotencyRepository implements IdempotencyRepository {
  async get(key: string, scope: string): Promise<IdempotencyRecord | null> {
    const r = await prisma.idempotencyRecord.findUnique({
      where: { key },
    });
    if (!r) return null;
    if (r.scope !== scope) return null;
    if (r.expiresAt < new Date()) {
      await prisma.idempotencyRecord.delete({ where: { key } }).catch(() => {});
      return null;
    }
    return {
      key: r.key,
      scope: r.scope,
      requestHash: r.requestHash,
      statusCode: r.statusCode,
      responseBody: r.responseBody,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
    };
  }

  async save(record: IdempotencyRecord): Promise<void> {
    await prisma.idempotencyRecord.upsert({
      where: { key: record.key },
      create: {
        key: record.key,
        scope: record.scope,
        requestHash: record.requestHash,
        statusCode: record.statusCode,
        responseBody: record.responseBody,
        createdAt: new Date(record.createdAt),
        expiresAt: new Date(record.expiresAt),
      },
      update: {
        scope: record.scope,
        requestHash: record.requestHash,
        statusCode: record.statusCode,
        responseBody: record.responseBody,
        expiresAt: new Date(record.expiresAt),
      },
    });
  }
}

export class PrismaShoppingIntentRepository implements ShoppingIntentRepository {
  private fallback = new InMemoryShoppingIntentRepository();

  async findById(id: string): Promise<ShoppingIntent | null> {
    return this.fallback.findById(id);
  }
  async findByBuyerId(buyerId: string): Promise<ShoppingIntent[]> {
    return this.fallback.findByBuyerId(buyerId);
  }
  async create(intent: ShoppingIntent): Promise<ShoppingIntent> {
    return this.fallback.create(intent);
  }
  async update(id: string, data: Partial<ShoppingIntent>): Promise<ShoppingIntent> {
    return this.fallback.update(id, data);
  }
}

export class PrismaShoppingSessionRepository implements ShoppingSessionRepository {
  private fallback = new InMemoryShoppingSessionRepository();

  async findById(id: string): Promise<ShoppingSession | null> {
    return this.fallback.findById(id);
  }
  async findByIntentId(intentId: string): Promise<ShoppingSession | null> {
    return this.fallback.findByIntentId(intentId);
  }
  async findByBuyerId(buyerId: string): Promise<ShoppingSession[]> {
    return this.fallback.findByBuyerId(buyerId);
  }
  async create(session: ShoppingSession): Promise<ShoppingSession> {
    return this.fallback.create(session);
  }
  async update(id: string, data: Partial<ShoppingSession>): Promise<ShoppingSession> {
    return this.fallback.update(id, data);
  }
}

