import { MemoryProvider } from "./interfaces";
import {
  ElasticMemoryDocument,
  MemorySearchOptions,
  MemorySearchResponse,
  ElasticStatusResponse,
} from "@/lib/elastic/types";
import { indexMemoryDocument } from "@/lib/elastic/indexer";
import { searchMemories } from "@/lib/elastic/search";
import { getElasticClusterInfo, isElasticAvailable } from "@/lib/elastic/client";
import { MEMORY_INDEX } from "@/lib/elastic/indexes";
import { isElasticConfigured } from "@/lib/config/env";

export class ElasticMemoryProvider implements MemoryProvider {
  readonly providerId = "ELASTICSEARCH_SERVERLESS";

  async indexMemory(doc: ElasticMemoryDocument): Promise<void> {
    await indexMemoryDocument(doc);
  }

  async searchMemories(options: MemorySearchOptions): Promise<MemorySearchResponse> {
    return searchMemories(options);
  }

  async getStatus(): Promise<ElasticStatusResponse> {
    const configured = isElasticConfigured();
    const connected = await isElasticAvailable();
    const cluster = await getElasticClusterInfo();

    return {
      configured,
      connected,
      clusterName: cluster.clusterName,
      version: cluster.version,
      indexName: MEMORY_INDEX,
      documentCount: 0,
      lastSync: new Date().toISOString(),
    };
  }
}
