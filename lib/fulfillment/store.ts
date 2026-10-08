import { FulfillmentPlan } from "@/types/fulfillment";
import { NegotiationAgreement } from "@/types/negotiation";
import { findProductById } from "@/lib/channel3/registry";
import { getProductById } from "@/data/products";
import { generateFulfillmentSchedule, ScheduleCalculationOptions } from "./scheduler";
import { FULFILLMENT_RESOURCES } from "./resources";

/**
 * Server-side persistent in-memory store for PayVia Fulfillment Plans.
 * Bound to server-validated agreements and PayPal transaction records.
 */

const globalStore = globalThis as unknown as {
  __payviaFulfillmentPlans?: Map<string, FulfillmentPlan>;
};

if (!globalStore.__payviaFulfillmentPlans) {
  globalStore.__payviaFulfillmentPlans = new Map<string, FulfillmentPlan>();
}

const fulfillmentPlans = globalStore.__payviaFulfillmentPlans;

/**
 * Builds a typed FulfillmentPlan from a negotiated agreement.
 */
export function buildFulfillmentPlan(
  agreement: NegotiationAgreement,
  options?: ScheduleCalculationOptions
): FulfillmentPlan {
  const fulfillmentId = `ful_${agreement.negotiationId || agreement.id}`;

  // Look up product from registry or catalog
  const product = findProductById(agreement.productId) || getProductById(agreement.productId);

  const schedule = generateFulfillmentSchedule(agreement, product, options);

  const plan: FulfillmentPlan = {
    id: fulfillmentId,
    negotiationId: agreement.negotiationId,
    agreementId: agreement.id,
    paypalOrderId: options?.paypalOrderId || `PAYID-${agreement.negotiationId.slice(-8).toUpperCase()}-SANDBOX`,
    paypalCaptureId: options?.paypalCaptureId,
    productId: agreement.productId,
    productName: agreement.productName,
    productCategory: product?.category || "Consumer Electronics",
    source: product?.source === "channel3" ? "channel3" : "demo",
    merchantName: product?.merchantName || "Verified Retailer",
    productUrl: product?.productUrl,
    externalId: product?.externalId,
    quantity: 1,
    originalPrice: agreement.originalPrice,
    agreedPrice: agreement.finalPrice,
    savings: agreement.savings,
    currency: agreement.currency || "USD",
    buyerMaxDeliveryDays: agreement.buyerMaxDeliveryDays,
    negotiatedDeliveryDays: agreement.deliveryDays,
    createdAt: agreement.createdAt || new Date().toISOString(),
    deliveryDeadline: schedule.deliveryDeadline,
    promisedDeliveryDate: schedule.promisedDeliveryDate,
    status: schedule.status,
    totalDurationDays: schedule.totalDurationDays,
    tasks: schedule.tasks,
    resources: FULFILLMENT_RESOURCES,
    dependencies: schedule.dependencies,
    riskAnalysis: schedule.riskAnalysis,
  };

  return plan;
}

export function saveFulfillmentPlan(plan: FulfillmentPlan): void {
  fulfillmentPlans.set(plan.id, plan);
  fulfillmentPlans.set(plan.negotiationId, plan);
  fulfillmentPlans.set(plan.agreementId, plan);

  // Asynchronously index fulfillment plan into Elasticsearch Serverless
  import("@/lib/elastic/indexer")
    .then(({ indexFulfillmentPlanMemory }) => {
      indexFulfillmentPlanMemory(plan).catch(() => {});
    })
    .catch(() => {});
}

export function getFulfillmentPlan(idOrNegotiationId: string): FulfillmentPlan | undefined {
  return fulfillmentPlans.get(idOrNegotiationId);
}

export function getAllFulfillmentPlans(): FulfillmentPlan[] {
  const unique = new Map<string, FulfillmentPlan>();
  for (const plan of fulfillmentPlans.values()) {
    unique.set(plan.id, plan);
  }

  // If no live plans yet, generate demo plans from benchmarks
  if (unique.size === 0) {
    seedBenchmarkFulfillmentPlans();
    for (const plan of fulfillmentPlans.values()) {
      unique.set(plan.id, plan);
    }
  }

  return Array.from(unique.values());
}

/**
 * Ensures a fulfillment plan exists for a negotiated agreement, creating it if needed.
 */
export function getOrCreateFulfillmentPlan(
  agreement: NegotiationAgreement,
  options?: ScheduleCalculationOptions
): FulfillmentPlan {
  const existing = getFulfillmentPlan(agreement.negotiationId) || getFulfillmentPlan(agreement.id);
  if (existing) {
    if (options?.paypalOrderId) {
      existing.paypalOrderId = options.paypalOrderId;
    }
    if (options?.paypalCaptureId) {
      existing.paypalCaptureId = options.paypalCaptureId;
    }
    return existing;
  }

  const newPlan = buildFulfillmentPlan(agreement, options);
  saveFulfillmentPlan(newPlan);
  return newPlan;
}

/**
 * Pre-populates default benchmark plans for demo and verification.
 */
function seedBenchmarkFulfillmentPlans(): void {
  const benchmarkAgreement1: NegotiationAgreement = {
    id: "agree_laptop_bench",
    negotiationId: "sess_laptop_bench",
    productId: "prod_laptop_pro",
    productName: "Laptop Pro 16",
    originalPrice: 800.0,
    finalPrice: 750.0,
    savings: 50.0,
    deliveryDays: 5,
    buyerMaxPrice: 760.0,
    buyerMaxDeliveryDays: 5,
    merchantMinPrice: 730.0,
    currency: "USD",
    status: "AGREED",
    roundsCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    userApproved: true,
    termsSummary: "Agreed at $750 with 5-day delivery",
    finalAgreedPrice: 750.0,
    savingsAmount: 50.0,
    totalSettlementAmount: 750.0,
  };

  const plan1 = buildFulfillmentPlan(benchmarkAgreement1, {
    paypalOrderId: "PAYID-LAPTOP-750-SANDBOX",
  });
  saveFulfillmentPlan(plan1);

  const benchmarkAgreement2: NegotiationAgreement = {
    id: "agree_headphones_bench",
    negotiationId: "sess_headphones_bench",
    productId: "ch3_live_headphone_pro",
    productName: "Studio Pro Wireless Headphones",
    originalPrice: 299.99,
    finalPrice: 265.0,
    savings: 34.99,
    deliveryDays: 3,
    buyerMaxPrice: 275.0,
    buyerMaxDeliveryDays: 3,
    merchantMinPrice: 240.0,
    currency: "USD",
    status: "AGREED",
    roundsCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    userApproved: true,
    termsSummary: "Channel3 item negotiated at $265 with 3-day delivery",
    finalAgreedPrice: 265.0,
    savingsAmount: 34.99,
    totalSettlementAmount: 265.0,
  };

  const plan2 = buildFulfillmentPlan(benchmarkAgreement2, {
    paypalOrderId: "PAYID-CH3-STUDIO-SANDBOX",
  });
  saveFulfillmentPlan(plan2);
}

// Seed on startup
seedBenchmarkFulfillmentPlans();
