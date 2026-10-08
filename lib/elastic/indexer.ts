import { ElasticMemoryDocument } from "./types";
import { getElasticClient } from "./client";
import { ensureMemoryIndex, MEMORY_INDEX } from "./indexes";
import { NegotiationAgreement, NegotiationSession } from "@/types/negotiation";
import { FulfillmentPlan } from "@/types/fulfillment";

// In-memory fallback repository to ensure 100% resilient retrieval if Elasticsearch is offline
const globalStore = globalThis as unknown as {
  __payviaLocalMemories?: Map<string, ElasticMemoryDocument>;
};

if (!globalStore.__payviaLocalMemories) {
  globalStore.__payviaLocalMemories = new Map<string, ElasticMemoryDocument>();
}

export const localMemoryStore = globalStore.__payviaLocalMemories;

/**
 * Indexes a structured memory document into Elasticsearch idempotently with fallback store persistence.
 */
export async function indexMemoryDocument(
  doc: ElasticMemoryDocument,
  targetIndex: string = MEMORY_INDEX
): Promise<boolean> {
  // Always persist to local resilient store
  localMemoryStore.set(doc.memoryId, doc);

  const client = getElasticClient();
  if (!client) {
    return true; // Graceful fallback
  }

  try {
    await ensureMemoryIndex(targetIndex);

    await client.index({
      index: targetIndex,
      id: doc.memoryId, // Deterministic document ID ensures 100% idempotency
      document: doc,
      refresh: "wait_for",
    });

    return true;
  } catch (error) {
    console.warn(
      `[Elasticsearch Indexer] Non-blocking index notice for '${doc.memoryId}':`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

/**
 * Bulk indexes an array of memory documents.
 */
export async function bulkIndexMemories(
  docs: ElasticMemoryDocument[],
  targetIndex: string = MEMORY_INDEX
): Promise<number> {
  let successCount = 0;
  for (const doc of docs) {
    const ok = await indexMemoryDocument(doc, targetIndex);
    if (ok) successCount++;
  }
  return successCount;
}

/**
 * Normalizes an autonomous negotiation session into structured memory documents.
 */
export async function indexNegotiationSession(
  session: NegotiationSession
): Promise<void> {
  try {
    const isAgreed = session.status === "AGREED";
    const product = session.product;
    const ag = session.agreement;

    const originalPrice = product.originalPrice;
    const agreedPrice = isAgreed && ag ? ag.finalPrice : 0;
    const savings = isAgreed && ag ? ag.savings : 0;
    const deliveryDays = isAgreed && ag ? ag.deliveryDays : session.buyerConstraints.maxDeliveryDays;

    // 1. Buyer Negotiation Memory
    const buyerContent = isAgreed
      ? `Buyer negotiated "${product.name}" from $${originalPrice.toFixed(2)} to $${agreedPrice.toFixed(
          2
        )}, saving $${savings.toFixed(2)} with a ${deliveryDays}-day delivery commitment.`
      : `Buyer attempted negotiation for "${product.name}" with a budget ceiling of $${session.buyerConstraints.maxBudget.toFixed(
          2
        )}, but no agreement was reached with the merchant.`;

    const buyerDoc: ElasticMemoryDocument = {
      memoryId: `mem_buyer_neg_${session.id}`,
      memoryType: "negotiation",
      actorType: "buyer",
      productId: product.id,
      productTitle: product.name,
      category: product.category,
      source: product.source === "channel3" ? "channel3" : "demo",
      merchantName: product.merchantName || "Verified Retailer",
      negotiationId: session.id,
      agreementId: ag?.id,
      originalPrice,
      agreedPrice,
      savings,
      deliveryDays,
      outcome: isAgreed ? "AGREED" : "FAILED",
      timestamp: session.createdAt || new Date().toISOString(),
      content: buyerContent,
      metadata: {
        roundsCount: session.currentRound,
        buyerMaxBudget: session.buyerConstraints.maxBudget,
        buyerTargetPrice: session.buyerConstraints.targetPrice,
      },
    };

    await indexMemoryDocument(buyerDoc);

    // 2. Merchant Negotiation Memory & Pattern
    const merchantContent = isAgreed
      ? `Merchant accepted $${agreedPrice.toFixed(2)} for "${product.name}" (List: $${originalPrice.toFixed(
          2
        )}, Floor: $${session.merchantConstraints.minAcceptablePrice.toFixed(2)}), offering a discount of ${(
          (savings / originalPrice) *
          100
        ).toFixed(1)}% for ${deliveryDays}-day delivery.`
      : `Merchant held price floor at $${session.merchantConstraints.minAcceptablePrice.toFixed(
          2
        )} for "${product.name}" when buyer offered below acceptable threshold.`;

    const merchantDoc: ElasticMemoryDocument = {
      memoryId: `mem_merchant_neg_${session.id}`,
      memoryType: "merchant_pattern",
      actorType: "merchant",
      productId: product.id,
      productTitle: product.name,
      category: product.category,
      source: product.source === "channel3" ? "channel3" : "demo",
      merchantName: product.merchantName || "Verified Retailer",
      negotiationId: session.id,
      agreementId: ag?.id,
      originalPrice,
      agreedPrice,
      savings,
      deliveryDays,
      outcome: isAgreed ? "AGREED" : "FAILED",
      timestamp: session.createdAt || new Date().toISOString(),
      content: merchantContent,
      metadata: {
        roundsCount: session.currentRound,
        merchantFloor: session.merchantConstraints.minAcceptablePrice,
      },
    };

    await indexMemoryDocument(merchantDoc);
  } catch (err) {
    console.warn("[Elasticsearch Indexer] Failed to index negotiation session safely:", err);
  }
}

/**
 * Normalizes a PayPal capture settlement event into a purchase memory document.
 */
export async function indexPaymentSettlement(
  agreement: NegotiationAgreement,
  paypalOrderId: string,
  paypalCaptureId?: string
): Promise<void> {
  try {
    const doc: ElasticMemoryDocument = {
      memoryId: `mem_purchase_${paypalOrderId}`,
      memoryType: "purchase",
      actorType: "buyer",
      productId: agreement.productId,
      productTitle: agreement.productName,
      source: "demo",
      negotiationId: agreement.negotiationId,
      agreementId: agreement.id,
      paypalOrderId,
      originalPrice: agreement.originalPrice,
      agreedPrice: agreement.finalPrice,
      savings: agreement.savings,
      deliveryDays: agreement.deliveryDays,
      outcome: "SETTLED",
      timestamp: new Date().toISOString(),
      content: `Purchase verified and settled via PayPal Sandbox: "${agreement.productName}" captured at $${agreement.finalPrice.toFixed(
        2
      )} ${agreement.currency} with ${agreement.deliveryDays}-day delivery guarantee (PayPal Order ID: ${paypalOrderId}).`,
      metadata: {
        paypalCaptureId,
      },
    };

    await indexMemoryDocument(doc);
  } catch (err) {
    console.warn("[Elasticsearch Indexer] Non-blocking payment index error:", err);
  }
}

/**
 * Normalizes a scheduled fulfillment plan into an operational memory document.
 */
export async function indexFulfillmentPlanMemory(
  plan: FulfillmentPlan
): Promise<void> {
  try {
    const doc: ElasticMemoryDocument = {
      memoryId: `mem_ful_${plan.id}`,
      memoryType: "fulfillment",
      actorType: "system",
      productId: plan.productId,
      productTitle: plan.productName,
      category: plan.productCategory,
      source: plan.source,
      merchantName: plan.merchantName,
      negotiationId: plan.negotiationId,
      agreementId: plan.agreementId,
      paypalOrderId: plan.paypalOrderId,
      deliveryDays: plan.negotiatedDeliveryDays,
      outcome: plan.status === "AT_RISK" ? "IN_PROGRESS" : "DELIVERED",
      timestamp: plan.createdAt || new Date().toISOString(),
      content: `Fulfillment scheduled for "${plan.productName}" with ${plan.tasks.length} synchronized stages. Handover deadline: ${new Date(
        plan.deliveryDeadline
      ).toLocaleDateString()}, Promised handover: ${new Date(
        plan.promisedDeliveryDate
      ).toLocaleDateString()} (${plan.riskAnalysis.slackHours}h slack margin, Status: ${plan.status}).`,
      metadata: {
        status: plan.status,
        slackHours: plan.riskAnalysis.slackHours,
      },
    };

    await indexMemoryDocument(doc);
  } catch (err) {
    console.warn("[Elasticsearch Indexer] Non-blocking fulfillment index error:", err);
  }
}

/**
 * Seeds benchmark historical memories so that the system immediately demonstrates cross-session recall.
 */
export function seedHistoricalBenchmarkMemories(): { success: boolean; count: number } {
  const benchmarks: ElasticMemoryDocument[] = [
    {
      memoryId: "mem_hist_laptop_101",
      memoryType: "negotiation",
      actorType: "buyer",
      productId: "prod_laptop_pro",
      productTitle: "AeroBook Pro 16 AI Workstation",
      category: "Laptops & Computing",
      source: "demo",
      merchantName: "AeroComputing Official Store",
      originalPrice: 800.0,
      agreedPrice: 752.0,
      savings: 48.0,
      deliveryDays: 5,
      outcome: "AGREED",
      timestamp: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
      content:
        "Buyer negotiated AeroBook Pro 16 AI Workstation from $800.00 to $752.00, saving $48.00 with a 5-day delivery window.",
    },
    {
      memoryId: "mem_hist_headphones_102",
      memoryType: "negotiation",
      actorType: "buyer",
      productId: "prod_aurora_headphones",
      productTitle: "AuraPro ANC Wireless Headphones",
      category: "Audio & Headphones",
      source: "demo",
      merchantName: "Aura Audio Labs",
      originalPrice: 299.99,
      agreedPrice: 245.0,
      savings: 54.99,
      deliveryDays: 3,
      outcome: "AGREED",
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      content:
        "Buyer negotiated AuraPro ANC Wireless Headphones from $299.99 to $245.00, saving $54.99 with 3-day expedited delivery.",
    },
    {
      memoryId: "mem_hist_ch3_thinkpad_103",
      memoryType: "negotiation",
      actorType: "buyer",
      productId: "ch3_thinkpad_x1",
      productTitle: "ThinkPad X1 Carbon Gen 11 Ultrabook",
      category: "Laptops & Computing",
      source: "channel3",
      merchantName: "Lenovo Official Store",
      originalPrice: 749.99,
      agreedPrice: 704.99,
      savings: 45.0,
      deliveryDays: 5,
      outcome: "AGREED",
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      content:
        "Buyer negotiated Channel3 discovered ThinkPad X1 Carbon from $749.99 to $704.99, saving $45.00 with 5-day delivery.",
    },
    {
      memoryId: "mem_hist_pattern_audio_104",
      memoryType: "merchant_pattern",
      actorType: "merchant",
      productId: "prod_aurora_headphones",
      productTitle: "AuraPro ANC Wireless Headphones",
      category: "Audio & Headphones",
      source: "demo",
      merchantName: "Aura Audio Labs",
      originalPrice: 299.99,
      agreedPrice: 250.0,
      savings: 49.99,
      deliveryDays: 3,
      outcome: "AGREED",
      timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      content:
        "Audio category items routinely close at 10-18% discounts when buyers request 3-4 day delivery windows.",
    },
    {
      memoryId: "mem_hist_ful_laptop_105",
      memoryType: "fulfillment",
      actorType: "system",
      productId: "prod_laptop_pro",
      productTitle: "AeroBook Pro 16 AI Workstation",
      category: "Laptops & Computing",
      source: "demo",
      merchantName: "AeroComputing Official Store",
      deliveryDays: 5,
      outcome: "DELIVERED",
      timestamp: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      content:
        "Historical fulfillment for AeroBook Pro 16 completed in 4.2 days across 7 stages with 19h safety slack.",
      metadata: {
        status: "COMPLETED",
        slackHours: 19,
      },
    },
  ];

  for (const doc of benchmarks) {
    localMemoryStore.set(doc.memoryId, doc);
  }

  return { success: true, count: benchmarks.length };
}

// Pre-seed local store on startup
seedHistoricalBenchmarkMemories();

