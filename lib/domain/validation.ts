import { z } from "zod";

export const PaymentTimingSchema = z.enum(["IMMEDIATE", "NET_15", "NET_30", "ESCROW_DELIVERY"]);

export const PlatformCreateSchema = z.object({
  name: z.string().min(2).max(100),
  webhookUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const MerchantCreateSchema = z.object({
  platformId: z.string().min(3),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  settlementEmail: z.string().email().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const BuyerCreateSchema = z.object({
  platformId: z.string().min(3),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  metadata: z.record(z.unknown()).optional(),
});

export const CatalogItemCreateSchema = z.object({
  platformId: z.string().min(3),
  merchantId: z.string().min(3),
  sku: z.string().max(50).optional(),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  listPrice: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  stockStatus: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]).default("IN_STOCK"),
  source: z.enum(["internal", "channel3", "demo"]).default("internal"),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const TransactionItemIntentSchema = z.object({
  catalogItemId: z.string().min(1),
  title: z.string().min(1),
  quantity: z.number().int().positive(),
  listPrice: z.number().positive(),
  currency: z.string().length(3).default("USD"),
});

export const BuyerConstraintsSchema = z.object({
  maxTotal: z.number().positive(),
  maxDeliveryDays: z.number().int().positive().max(60),
  allowedPaymentTiming: z.array(PaymentTimingSchema).optional(),
});

export const BuyerPreferencesSchema = z.object({
  paymentTiming: PaymentTimingSchema.optional(),
  deliveryPriority: z.enum(["HIGH", "NORMAL", "FLEXIBLE"]).optional(),
  notes: z.string().max(500).optional(),
});

export const TransactionIntentSchema = z.object({
  platformId: z.string().min(3).default("plat_default"),
  buyerId: z.string().min(3),
  merchantId: z.string().min(3),
  items: z.array(TransactionItemIntentSchema).min(1),
  currency: z.string().length(3).default("USD"),
  constraints: BuyerConstraintsSchema,
  preferences: BuyerPreferencesSchema.optional(),
});

export const MerchantNegotiationPolicySchema = z.object({
  platformId: z.string().min(3),
  merchantId: z.string().min(3),
  catalogItemId: z.string().optional(),
  enabled: z.boolean().default(true),
  currency: z.string().length(3).default("USD"),
  listPrice: z.number().positive(),
  minimumPrice: z.number().positive(), // Server-validated: must be <= listPrice
  minimumDeliveryDays: z.number().int().positive().default(1),
  maximumDeliveryDays: z.number().int().positive().default(14),
  immediateDiscountPercent: z.number().min(0).max(50).optional(),
  allowedPaymentTiming: z.array(PaymentTimingSchema).default(["IMMEDIATE"]),
  strategy: z.enum(["BALANCED_ECONOMIC", "MARGIN_PRESERVATION", "VOLUME_VELOCITY"]).default("BALANCED_ECONOMIC"),
}).refine((data) => data.minimumPrice <= data.listPrice, {
  message: "Merchant minimum price cannot exceed list price",
  path: ["minimumPrice"],
}).refine((data) => data.minimumDeliveryDays <= data.maximumDeliveryDays, {
  message: "Merchant minimum delivery days cannot exceed maximum delivery days",
  path: ["minimumDeliveryDays"],
});

export const BuyerNegotiationPolicySchema = z.object({
  platformId: z.string().min(3),
  buyerId: z.string().min(3),
  currency: z.string().length(3).default("USD"),
  maxBudget: z.number().positive(),
  maxDeliveryDays: z.number().int().positive().max(60),
  targetDiscountPercent: z.number().min(0).max(50).optional(),
  preferredPaymentTiming: PaymentTimingSchema.optional(),
  priority: z.enum(["PRICE_FIRST", "DELIVERY_FIRST", "BALANCED"]).default("BALANCED"),
});

export const ProposalCreateSchema = z.object({
  price: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  deliveryDays: z.number().int().positive().max(60),
  paymentTiming: PaymentTimingSchema.default("IMMEDIATE"),
  reasoningText: z.string().max(1000).optional(),
  senderAgentId: z.string().optional(),
});

export const SettleAgreementSchema = z.object({
  provider: z.enum(["PAYPAL_ORDERS_V2", "MOCK_SANDBOX"]).default("PAYPAL_ORDERS_V2"),
  returnUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const OfferPrioritySchema = z.enum(["PRICE", "DELIVERY", "BALANCED"]);

export const ShoppingIntentCreateSchema = z.object({
  platformId: z.string().min(3).default("plat_default"),
  buyerId: z.string().min(3).default("buyer_default"),
  query: z.string().min(2).max(500),
  constraints: z.object({
    maxTotal: z.number().positive(),
    maxDeliveryDays: z.number().int().positive().max(60),
    allowedPaymentTiming: z.array(PaymentTimingSchema).optional(),
  }),
  preferences: z.object({
    priority: OfferPrioritySchema.default("PRICE"),
    paymentTiming: PaymentTimingSchema.optional(),
    notes: z.string().max(500).optional(),
  }).optional(),
  quantity: z.number().int().positive().default(1),
});

export const OfferSelectSchema = z.object({
  offerId: z.string().min(1),
});

