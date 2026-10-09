import { isPostgresAuthoritative, assertProductionDatabaseConfigured } from "@/lib/db/prisma";
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
  InMemoryPlatformRepository,
  InMemoryMerchantRepository,
  InMemoryBuyerRepository,
  InMemoryAgentRepository,
  InMemoryCatalogRepository,
  InMemoryTransactionRepository,
  InMemoryPolicyRepository,
  InMemoryNegotiationRepository,
  InMemoryAgreementRepository,
  InMemorySettlementRepository,
  InMemoryAuditRepository,
  InMemoryIdempotencyRepository,
  InMemoryShoppingIntentRepository,
  InMemoryShoppingSessionRepository,
} from "./in-memory";

import {
  PrismaPlatformRepository,
  PrismaMerchantRepository,
  PrismaBuyerRepository,
  PrismaAgentRepository,
  PrismaCatalogRepository,
  PrismaTransactionRepository,
  PrismaPolicyRepository,
  PrismaNegotiationRepository,
  PrismaAgreementRepository,
  PrismaSettlementRepository,
  PrismaAuditRepository,
  PrismaIdempotencyRepository,
  PrismaShoppingIntentRepository,
  PrismaShoppingSessionRepository,
} from "./prisma-repositories";

export * from "./interfaces";
export * from "./in-memory";
export * from "./prisma-repositories";

// Assert that production environment cannot run without authoritative database
if (typeof window === "undefined") {
  assertProductionDatabaseConfigured();
}

const usePrisma = typeof window === "undefined" && isPostgresAuthoritative();

// Repository Registry: Authoritative PostgreSQL via Prisma when DATABASE_URL is present; In-Memory fallback for local development & unit tests
export const platformRepo: PlatformRepository = usePrisma
  ? new PrismaPlatformRepository()
  : new InMemoryPlatformRepository();

export const merchantRepo: MerchantRepository = usePrisma
  ? new PrismaMerchantRepository()
  : new InMemoryMerchantRepository();

export const buyerRepo: BuyerRepository = usePrisma
  ? new PrismaBuyerRepository()
  : new InMemoryBuyerRepository();

export const agentRepo: AgentRepository = usePrisma
  ? new PrismaAgentRepository()
  : new InMemoryAgentRepository();

export const catalogRepo: CatalogRepository = usePrisma
  ? new PrismaCatalogRepository()
  : new InMemoryCatalogRepository();

export const transactionRepo: TransactionRepository = usePrisma
  ? new PrismaTransactionRepository()
  : new InMemoryTransactionRepository();

export const policyRepo: PolicyRepository = usePrisma
  ? new PrismaPolicyRepository()
  : new InMemoryPolicyRepository();

export const negotiationRepo: NegotiationRepository = usePrisma
  ? new PrismaNegotiationRepository()
  : new InMemoryNegotiationRepository();

export const agreementRepo: AgreementRepository = usePrisma
  ? new PrismaAgreementRepository()
  : new InMemoryAgreementRepository();

export const settlementRepo: SettlementRepository = usePrisma
  ? new PrismaSettlementRepository()
  : new InMemorySettlementRepository();

export const auditRepo: AuditRepository = usePrisma
  ? new PrismaAuditRepository()
  : new InMemoryAuditRepository();

export const idempotencyRepo: IdempotencyRepository = usePrisma
  ? new PrismaIdempotencyRepository()
  : new InMemoryIdempotencyRepository();

export const shoppingIntentRepo: ShoppingIntentRepository = usePrisma
  ? new PrismaShoppingIntentRepository()
  : new InMemoryShoppingIntentRepository();

export const shoppingSessionRepo: ShoppingSessionRepository = usePrisma
  ? new PrismaShoppingSessionRepository()
  : new InMemoryShoppingSessionRepository();

