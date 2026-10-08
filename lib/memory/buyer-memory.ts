import { searchMemories } from "@/lib/elastic/search";
import { BuyerMemoryContext, ElasticMemoryDocument } from "@/lib/elastic/types";
import { Product } from "@/types/product";
import { BuyerConstraints } from "@/types/agent";

/**
 * Searches historical buyer negotiation memories related to the product being negotiated.
 */
export async function getBuyerContextForNegotiation(
  product: Product,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _constraints?: BuyerConstraints
): Promise<BuyerMemoryContext> {
  try {
    const searchRes = await searchMemories({
      query: `${product.name} ${product.category || ""}`,
      actorType: "buyer",
      memoryType: ["negotiation", "purchase"],
      limit: 3,
    });

    const memories: ElasticMemoryDocument[] = searchRes.results.map((r) => r.document);

    if (memories.length === 0) {
      return {
        hasMemory: false,
        memories: [],
        summaryText: "No prior negotiation history found for this product category.",
      };
    }

    const agreedMemories = memories.filter((m) => m.outcome === "AGREED" || m.outcome === "SETTLED");
    const bestRecent = agreedMemories[0] || memories[0];

    const summaryText = `Historical Negotiation Recall: Previously negotiated "${bestRecent.productTitle || product.name}" at $${bestRecent.agreedPrice?.toFixed(
      2
    ) || "N/A"} (saved $${bestRecent.savings?.toFixed(2) || "0.00"}, ${bestRecent.deliveryDays || 5}d delivery).`;

    return {
      hasMemory: true,
      memories,
      summaryText,
      similarPreviousProduct: bestRecent.productTitle,
      lastAgreedPrice: bestRecent.agreedPrice,
      lastSavings: bestRecent.savings,
      lastDeliveryDays: bestRecent.deliveryDays,
    };
  } catch (err) {
    console.warn("[Buyer Memory] Non-blocking retrieval warning:", err);
    return {
      hasMemory: false,
      memories: [],
      summaryText: "",
    };
  }
}
