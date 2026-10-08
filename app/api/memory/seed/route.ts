import { NextResponse } from "next/server";
import { bulkIndexMemories, seedHistoricalBenchmarkMemories, localMemoryStore } from "@/lib/elastic/indexer";

export const dynamic = "force-dynamic";

/**
 * POST /api/memory/seed
 * Idempotently seeds benchmark historical memories into Elasticsearch Serverless.
 */
export async function POST() {
  try {
    seedHistoricalBenchmarkMemories();
    const allDocs = Array.from(localMemoryStore.values());
    const indexedCount = await bulkIndexMemories(allDocs);

    return NextResponse.json({
      success: true,
      message: `Indexed ${indexedCount} historical benchmark memories into Elasticsearch.`,
      count: allDocs.length,
    });
  } catch (error) {
    console.error("[Memory Seed API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed benchmark memories",
        details: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
