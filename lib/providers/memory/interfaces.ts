import {
  ElasticMemoryDocument,
  MemorySearchOptions,
  MemorySearchResponse,
  ElasticStatusResponse,
} from "@/lib/elastic/types";

export interface MemoryProvider {
  readonly providerId: string;

  indexMemory(doc: ElasticMemoryDocument): Promise<void>;

  searchMemories(options: MemorySearchOptions): Promise<MemorySearchResponse>;

  getStatus(): Promise<ElasticStatusResponse>;
}
