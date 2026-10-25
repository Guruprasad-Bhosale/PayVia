-- CreateEnum
CREATE TYPE "PlatformStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEVELOPMENT');

-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "BuyerStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('BUYER', 'MERCHANT', 'PLATFORM');

-- CreateEnum
CREATE TYPE "AgentProvider" AS ENUM ('GEMINI_3_8_FLASH', 'DETERMINISTIC_RULES', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PaymentTiming" AS ENUM ('IMMEDIATE', 'NET_15', 'NET_30', 'ESCROW_DELIVERY');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INTENT_CREATED', 'NEGOTIATING', 'AGREED', 'SETTLED', 'FULFILLMENT_SCHEDULED', 'FULFILLED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "NegotiationStatus" AS ENUM ('DRAFT', 'OPEN', 'BUYER_PROPOSED', 'MERCHANT_PROPOSED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'ACCEPTED', 'USER_APPROVED', 'SETTLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SettlementProviderType" AS ENUM ('PAYPAL_ORDERS_V2', 'MOCK_SANDBOX');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('BUYER', 'MERCHANT', 'SYSTEM', 'AGENT', 'PLATFORM');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('TRANSACTION_CREATED', 'NEGOTIATION_STARTED', 'PROPOSAL_SUBMITTED', 'PROPOSAL_COUNTERED', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED', 'POLICY_VIOLATION_BLOCKED', 'AGREEMENT_CREATED', 'AGREEMENT_ACCEPTED', 'AGREEMENT_LOCKED', 'SETTLEMENT_REQUESTED', 'SETTLEMENT_CAPTURED', 'SETTLEMENT_FAILED', 'FULFILLMENT_SCHEDULED', 'FULFILLMENT_UPDATED');

-- CreateTable
CREATE TABLE "platforms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PlatformStatus" NOT NULL DEFAULT 'ACTIVE',
    "apiKeyHash" TEXT,
    "webhookUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "settlementEmail" TEXT,
    "status" "MerchantStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyers" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "BuyerStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "type" "AgentType" NOT NULL,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "capabilities" TEXT[],
    "policyVersion" INTEGER NOT NULL DEFAULT 1,
    "provider" "AgentProvider" NOT NULL DEFAULT 'GEMINI_3_8_FLASH',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "sku" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "listPrice" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stockStatus" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "source" TEXT NOT NULL DEFAULT 'internal',
    "imageUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'INTENT_CREATED',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "originalTotal" DOUBLE PRECISION NOT NULL,
    "finalTotal" DOUBLE PRECISION,
    "savingsTotal" DOUBLE PRECISION,
    "intent" JSONB NOT NULL,
    "activeNegotiationId" TEXT,
    "activeAgreementId" TEXT,
    "activeSettlementId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_policies" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "catalogItemId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "listPrice" DOUBLE PRECISION NOT NULL,
    "minimumPrice" DOUBLE PRECISION NOT NULL,
    "minimumDeliveryDays" INTEGER NOT NULL DEFAULT 1,
    "maximumDeliveryDays" INTEGER NOT NULL DEFAULT 14,
    "immediateDiscountPercent" DOUBLE PRECISION,
    "allowedPaymentTiming" TEXT[] DEFAULT ARRAY['IMMEDIATE']::TEXT[],
    "strategy" TEXT NOT NULL DEFAULT 'BALANCED_ECONOMIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buyer_policies" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "maxBudget" DOUBLE PRECISION NOT NULL,
    "maxDeliveryDays" INTEGER NOT NULL DEFAULT 7,
    "targetDiscountPercent" DOUBLE PRECISION,
    "preferredPaymentTiming" "PaymentTiming",
    "priority" TEXT NOT NULL DEFAULT 'BALANCED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negotiation_sessions" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "status" "NegotiationStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "roundsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "negotiation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "negotiationId" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderAgentId" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "deliveryDays" INTEGER NOT NULL,
    "paymentTiming" "PaymentTiming" NOT NULL DEFAULT 'IMMEDIATE',
    "savings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "reasoningText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreements" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "negotiationId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "items" JSONB NOT NULL,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "savings" DOUBLE PRECISION NOT NULL,
    "deliveryDays" INTEGER NOT NULL,
    "paymentTiming" "PaymentTiming" NOT NULL DEFAULT 'IMMEDIATE',
    "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
    "agreementHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "userApprovedAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "provider" "SettlementProviderType" NOT NULL DEFAULT 'PAYPAL_ORDERS_V2',
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "externalOrderId" TEXT,
    "externalCaptureId" TEXT,
    "payerEmail" TEXT,
    "payeeEmail" TEXT,
    "receiptUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedAt" TIMESTAMP(3),

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "actorType" "AuditActorType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "eventType" "AuditEventType" NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_records" (
    "key" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseBody" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signatureStatus" TEXT NOT NULL DEFAULT 'VERIFIED',
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "merchants_platformId_idx" ON "merchants"("platformId");

-- CreateIndex
CREATE INDEX "buyers_platformId_idx" ON "buyers"("platformId");

-- CreateIndex
CREATE INDEX "agents_platformId_ownerId_idx" ON "agents"("platformId", "ownerId");

-- CreateIndex
CREATE INDEX "catalog_items_platformId_merchantId_idx" ON "catalog_items"("platformId", "merchantId");

-- CreateIndex
CREATE INDEX "transactions_platformId_merchantId_buyerId_idx" ON "transactions"("platformId", "merchantId", "buyerId");

-- CreateIndex
CREATE INDEX "merchant_policies_merchantId_catalogItemId_idx" ON "merchant_policies"("merchantId", "catalogItemId");

-- CreateIndex
CREATE INDEX "buyer_policies_buyerId_idx" ON "buyer_policies"("buyerId");

-- CreateIndex
CREATE INDEX "negotiation_sessions_transactionId_idx" ON "negotiation_sessions"("transactionId");

-- CreateIndex
CREATE INDEX "proposals_negotiationId_idx" ON "proposals"("negotiationId");

-- CreateIndex
CREATE INDEX "agreements_transactionId_negotiationId_idx" ON "agreements"("transactionId", "negotiationId");

-- CreateIndex
CREATE INDEX "settlements_agreementId_transactionId_idx" ON "settlements"("agreementId", "transactionId");

-- CreateIndex
CREATE INDEX "audit_events_platformId_transactionId_idx" ON "audit_events"("platformId", "transactionId");

-- CreateIndex
CREATE INDEX "idempotency_records_scope_requestHash_idx" ON "idempotency_records"("scope", "requestHash");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_eventId_key" ON "webhook_events"("provider", "eventId");

-- AddForeignKey
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyers" ADD CONSTRAINT "buyers_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_policies" ADD CONSTRAINT "merchant_policies_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_policies" ADD CONSTRAINT "buyer_policies_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation_sessions" ADD CONSTRAINT "negotiation_sessions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_negotiationId_fkey" FOREIGN KEY ("negotiationId") REFERENCES "negotiation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_negotiationId_fkey" FOREIGN KEY ("negotiationId") REFERENCES "negotiation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
