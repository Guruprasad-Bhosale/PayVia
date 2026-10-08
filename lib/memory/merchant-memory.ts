import { searchMemories } from "@/lib/elastic/search";
import { ElasticMemoryDocument } from "@/lib/elastic/types";

/**
 * Retrieves historical merchant pricing patterns, category performance, and negotiation outcomes.
 */
export async function getMerchantHistoricalInsights(
  query: string,
  limit: number = 4
): Promise<{
  insights: string[];
  memories: ElasticMemoryDocument[];
}> {
  try {
    const searchRes = await searchMemories({
      query,
      actorType: "merchant",
      memoryType: ["merchant_pattern", "negotiation"],
      limit,
    });

    const memories = searchRes.results.map((r) => r.document);
    const insights = memories.map((m) => m.content);

    return {
      insights,
      memories,
    };
  } catch (err) {
    console.warn("[Merchant Memory] Non-blocking retrieval warning:", err);
    return {
      insights: [],
      memories: [],
    };
  }
}
