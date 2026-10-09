import { MemoryProvider } from "./interfaces";
import { ElasticMemoryProvider } from "./elastic.provider";
import { InMemoryMemoryProvider } from "./in-memory.provider";
import { isElasticConfigured } from "@/lib/config/env";

export * from "./interfaces";
export * from "./elastic.provider";
export * from "./in-memory.provider";

export const elasticMemoryProvider = new ElasticMemoryProvider();
export const inMemoryMemoryProvider = new InMemoryMemoryProvider();

export function getMemoryProvider(preferred?: string): MemoryProvider {
  if (preferred === "IN_MEMORY_FALLBACK") return inMemoryMemoryProvider;
  if (preferred === "ELASTICSEARCH_SERVERLESS") return elasticMemoryProvider;
  return isElasticConfigured() ? elasticMemoryProvider : inMemoryMemoryProvider;
}
