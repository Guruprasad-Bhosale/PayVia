import { MemoryProvider } from "./interfaces";
import {
  ElasticMemoryDocument,
  MemorySearchOptions,
  MemorySearchResponse,
  ElasticStatusResponse,
} from "@/lib/elastic/types";
import { localMemoryStore } from "@/lib/elastic/indexer";

export class InMemoryMemoryProvider implements MemoryProvider {
  readonly providerId = "IN_MEMORY_FALLBACK";

  async indexMemory(doc: ElasticMemoryDocument): Promise<void> {
    localMemoryStore.set(doc.memoryId, doc);
  }

  async searchMemories(options: MemorySearchOptions): Promise<MemorySearchResponse> {
    const q = options.query.toLowerCase().trim();
    const all = Array.from(localMemoryStore.values());

    const filtered = all.filter((doc) => {
      if (options.actorType && doc.actorType !== options.actorType) return false;
      if (options.memoryType) {
        if (Array.isArray(options.memoryType)) {
          if (!options.memoryType.includes(doc.memoryType)) return false;
        } else if (doc.memoryType !== options.memoryType) {
          return false;
        }
      }
      if (!q || q === "*") return true;
      return (
        doc.content.toLowerCase().includes(q) ||
        (doc.productTitle && doc.productTitle.toLowerCase().includes(q)) ||
        (doc.category && doc.category.toLowerCase().includes(q))
      );
    });

    const results = filtered.slice(0, options.limit || 5).map((doc) => ({
      document: doc,
      score: 1.0,
      similarityPct: 95,
      matchedField: "content",
    }));

    return {
      success: true,
      total: results.length,
      results,
      query: options.query,
      source: "fallback",
    };
  }

  async getStatus(): Promise<ElasticStatusResponse> {
    return {
      configured: false,
      connected: true,
      indexName: "in-memory-store",
      documentCount: localMemoryStore.size,
      lastSync: new Date().toISOString(),
    };
  }
}
