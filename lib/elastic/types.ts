/**
 * PayVia Elasticsearch Serverless Memory & Vector Types
 * Models persistent cross-session memories, semantic embeddings, and hybrid search results.
 */

export type MemoryType =
  | "negotiation"
  | "purchase"
  | "preference"
  | "product"
  | "fulfillment"
  | "merchant_pattern";

export type ActorType = "buyer" | "merchant" | "system";

export type MemoryOutcome =
  | "AGREED"
  | "FAILED"
  | "SETTLED"
  | "DELIVERED"
  | "IN_PROGRESS";

export interface ElasticMemoryDocument {
  memoryId: string;
  memoryType: MemoryType;
  actorType: ActorType;
  userId?: string;
  merchantId?: string;
  merchantName?: string;
  productId?: string;
  productTitle?: string;
  category?: string;
  source?: "channel3" | "demo";
  negotiationId?: string;
  agreementId?: string;
  paypalOrderId?: string;
  originalPrice?: number;
  agreedPrice?: number;
  savings?: number;
  deliveryDays?: number;
  outcome?: MemoryOutcome;
  timestamp: string; // ISO 8601
  content: string; // Semantic narrative text for vector & BM25 hybrid matching
  metadata?: Record<string, unknown>;
}

export interface MemorySearchOptions {
  query: string;
  memoryType?: MemoryType | MemoryType[];
  actorType?: ActorType;
  productId?: string;
  category?: string;
  source?: "channel3" | "demo";
  limit?: number;
  minScore?: number;
}

export interface MemorySearchResult {
  document: ElasticMemoryDocument;
  score: number;
  similarityPct: number;
  matchedField?: string;
}

export interface MemorySearchResponse {
  success: boolean;
  results: MemorySearchResult[];
  total: number;
  query: string;
  source: "elasticsearch" | "fallback";
  error?: string;
}

export interface ElasticStatusResponse {
  configured: boolean;
  connected: boolean;
  clusterName?: string;
  version?: string;
  indexName: string;
  documentCount: number;
  lastSync?: string;
  error?: string;
}

export interface BuyerMemoryContext {
  hasMemory: boolean;
  memories: ElasticMemoryDocument[];
  summaryText: string;
  similarPreviousProduct?: string;
  lastAgreedPrice?: number;
  lastSavings?: number;
  lastDeliveryDays?: number;
}
