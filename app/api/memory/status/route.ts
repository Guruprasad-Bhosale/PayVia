import { NextResponse } from "next/server";
import { getElasticClusterInfo, isElasticConfigured } from "@/lib/elastic/client";
import { MEMORY_INDEX, getMemoryIndexCount } from "@/lib/elastic/indexes";
import { localMemoryStore } from "@/lib/elastic/indexer";

export const dynamic = "force-dynamic";

/**
 * GET /api/memory/status
 * Returns safe diagnostic status and count for Elasticsearch Serverless AI Memory layer.
 * Zero private credentials or API keys exposed.
 */
export async function GET() {
  try {
    const configured = isElasticConfigured();
    const clusterInfo = await getElasticClusterInfo();
    const esCount = configured ? await getMemoryIndexCount(MEMORY_INDEX) : 0;
    const totalCount = esCount > 0 ? esCount : localMemoryStore.size;

    return NextResponse.json({
      success: true,
      configured,
      connected: clusterInfo.connected,
      clusterName: clusterInfo.clusterName || "payvia-serverless-memory",
      version: clusterInfo.version || "Serverless Vector",
      indexName: MEMORY_INDEX,
      documentCount: totalCount,
      lastSync: new Date().toISOString(),
      source: clusterInfo.connected ? "elasticsearch_serverless" : "resilient_local_memory",
    });
  } catch (error) {
    console.warn("[Memory Status API Error]:", error);
    return NextResponse.json({
      success: true,
      configured: false,
      connected: false,
      indexName: MEMORY_INDEX,
      documentCount: localMemoryStore.size,
      source: "resilient_local_memory",
    });
  }
}
