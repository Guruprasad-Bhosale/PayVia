import { searchMemories } from "@/lib/elastic/search";
import { ElasticMemoryDocument } from "@/lib/elastic/types";

/**
 * Retrieves historical fulfillment logs, carrier performance, and delivery trends.
 */
export async function getFulfillmentHistoricalLogs(
  query: string,
  limit: number = 3
): Promise<{
  logs: string[];
  memories: ElasticMemoryDocument[];
}> {
  try {
    const searchRes = await searchMemories({
      query,
      memoryType: "fulfillment",
      limit,
    });

    const memories = searchRes.results.map((r) => r.document);
    const logs = memories.map((m) => m.content);

    return {
      logs,
      memories,
    };
  } catch (err) {
    console.warn("[Fulfillment Memory] Non-blocking retrieval warning:", err);
    return {
      logs: [],
      memories: [],
    };
  }
}
