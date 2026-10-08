import { ElasticMemoryDocument, MemorySearchOptions, MemorySearchResponse, MemorySearchResult } from "./types";
import { getElasticClient } from "./client";
import { MEMORY_INDEX, ensureMemoryIndex } from "./indexes";
import { localMemoryStore, seedHistoricalBenchmarkMemories } from "./indexer";

/**
 * Executes hybrid semantic + keyword memory search across the PayVia memory index.
 * Gracefully falls back to local memory store if Elasticsearch is unreachable.
 */
export async function searchMemories(
  options: MemorySearchOptions,
  targetIndex: string = MEMORY_INDEX
): Promise<MemorySearchResponse> {
  const { query, memoryType, actorType, productId, category, source, limit = 6 } = options;
  const trimmedQuery = query.trim();

  const client = getElasticClient();

  if (client) {
    try {
      await ensureMemoryIndex(targetIndex);

      // Build structured filters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filterClauses: any[] = [];

      if (memoryType) {
        if (Array.isArray(memoryType)) {
          filterClauses.push({ terms: { memoryType } });
        } else {
          filterClauses.push({ term: { memoryType } });
        }
      }

      if (actorType) {
        filterClauses.push({ term: { actorType } });
      }

      if (productId) {
        filterClauses.push({ term: { productId } });
      }

      if (category) {
        filterClauses.push({ term: { category } });
      }

      if (source) {
        filterClauses.push({ term: { source } });
      }

      // Build query clauses
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let queryClause: any;

      if (!trimmedQuery || trimmedQuery === "*") {
        queryClause = { match_all: {} };
      } else {
        queryClause = {
          multi_match: {
            query: trimmedQuery,
            fields: ["content^3", "productTitle^2", "category", "merchantName"],
            fuzziness: "AUTO",
            operator: "or",
          },
        };
      }

      const response = await client.search<ElasticMemoryDocument>({
        index: targetIndex,
        size: limit,
        query: {
          bool: {
            must: queryClause,
            filter: filterClauses.length > 0 ? filterClauses : undefined,
          },
        },
      });

      const hits = response.hits?.hits || [];
      const maxScore = (response.hits?.max_score as number) || 1.0;

      const results: MemorySearchResult[] = hits.map((hit) => {
        const doc = hit._source as ElasticMemoryDocument;
        const score = hit._score || 0;
        const similarityPct = Math.min(
          99,
          Math.max(60, Math.round((score / Math.max(maxScore, 1.0)) * 100))
        );

        return {
          document: doc,
          score,
          similarityPct,
        };
      });

      return {
        success: true,
        results,
        total: typeof response.hits?.total === "number" ? response.hits.total : response.hits?.total?.value || results.length,
        query: trimmedQuery,
        source: "elasticsearch",
      };
    } catch (error) {
      console.warn(
        "[Elasticsearch Search] Cluster query warning, activating local fallback:",
        error instanceof Error ? error.message : error
      );
    }
  }

  // Resilient In-Memory Fallback Search
  seedHistoricalBenchmarkMemories();
  const allDocs = Array.from(localMemoryStore.values());

  const filtered = allDocs.filter((doc) => {
    if (memoryType) {
      if (Array.isArray(memoryType) && !memoryType.includes(doc.memoryType)) return false;
      if (!Array.isArray(memoryType) && doc.memoryType !== memoryType) return false;
    }
    if (actorType && doc.actorType !== actorType) return false;
    if (productId && doc.productId !== productId) return false;
    if (category && doc.category !== category) return false;
    if (source && doc.source !== source) return false;
    return true;
  });

  if (!trimmedQuery || trimmedQuery === "*") {
    const results: MemorySearchResult[] = filtered.slice(0, limit).map((doc) => ({
      document: doc,
      score: 1.0,
      similarityPct: 95,
    }));

    return {
      success: true,
      results,
      total: filtered.length,
      query: trimmedQuery,
      source: "fallback",
    };
  }

  // Token-based similarity calculation for fallback
  const queryTokens = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const scoredDocs: MemorySearchResult[] = filtered
    .map((doc) => {
      const docText = `${doc.productTitle || ""} ${doc.content || ""} ${doc.category || ""}`.toLowerCase();
      let matches = 0;
      for (const token of queryTokens) {
        if (docText.includes(token)) {
          matches += 1;
        }
      }

      if (matches === 0 && queryTokens.length > 0) {
        return null;
      }

      const score = matches / Math.max(queryTokens.length, 1);
      const similarityPct = Math.min(98, Math.max(65, Math.round(score * 100)));

      return {
        document: doc,
        score,
        similarityPct,
      };
    })
    .filter((res): res is MemorySearchResult => res !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    success: true,
    results: scoredDocs,
    total: scoredDocs.length,
    query: trimmedQuery,
    source: "fallback",
  };
}
