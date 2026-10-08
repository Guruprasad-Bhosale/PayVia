import { getElasticClient } from "./client";

export const MEMORY_INDEX = "payvia-memory";
export const PROBE_TEST_INDEX = "payvia_test_probe";

export const MEMORY_INDEX_MAPPINGS = {
  properties: {
    memoryId: { type: "keyword" as const },
    memoryType: { type: "keyword" as const },
    actorType: { type: "keyword" as const },
    userId: { type: "keyword" as const },
    merchantId: { type: "keyword" as const },
    merchantName: { type: "keyword" as const },
    productId: { type: "keyword" as const },
    productTitle: {
      type: "text" as const,
      fields: { keyword: { type: "keyword" as const } },
    },
    category: { type: "keyword" as const },
    source: { type: "keyword" as const },
    negotiationId: { type: "keyword" as const },
    agreementId: { type: "keyword" as const },
    paypalOrderId: { type: "keyword" as const },
    originalPrice: { type: "float" as const },
    agreedPrice: { type: "float" as const },
    savings: { type: "float" as const },
    deliveryDays: { type: "integer" as const },
    outcome: { type: "keyword" as const },
    timestamp: { type: "date" as const },
    content: { type: "text" as const },
  },
};

/**
 * Idempotently initializes the PayVia memory index in Elasticsearch.
 * GUARANTEE: Never drops, wipes, or deletes existing production memory data.
 */
export async function ensureMemoryIndex(targetIndex: string = MEMORY_INDEX): Promise<boolean> {
  const client = getElasticClient();
  if (!client) {
    return false;
  }

  try {
    const exists = await client.indices.exists({ index: targetIndex });

    if (!exists) {
      await client.indices.create({
        index: targetIndex,
        mappings: MEMORY_INDEX_MAPPINGS,
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
      });
      console.log(`[Elasticsearch] Initialized memory index '${targetIndex}' successfully.`);
    }

    return true;
  } catch (error) {
    console.warn(`[Elasticsearch] Notice: Index check for '${targetIndex}':`, error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Retrieves the total count of indexed memories safely.
 */
export async function getMemoryIndexCount(targetIndex: string = MEMORY_INDEX): Promise<number> {
  const client = getElasticClient();
  if (!client) {
    return 0;
  }

  try {
    const res = await client.count({ index: targetIndex });
    return res.count || 0;
  } catch {
    return 0;
  }
}
