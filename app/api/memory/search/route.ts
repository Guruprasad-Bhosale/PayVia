import { NextRequest, NextResponse } from "next/server";
import { searchMemories } from "@/lib/elastic/search";
import { MemorySearchOptions } from "@/lib/elastic/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/memory/search
 * Executes safe semantic & hybrid search over the PayVia Elasticsearch AI memory layer.
 * Strictly accepts typed search parameters; rejects arbitrary raw DSL queries.
 */
export async function POST(req: NextRequest) {
  try {
    let body: Partial<MemorySearchOptions> = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is allowed, defaults to match all
    }

    const query = typeof body.query === "string" ? body.query : "*";
    const memoryType = body.memoryType;
    const actorType = body.actorType;
    const category = body.category;
    const productId = body.productId;
    const limit = typeof body.limit === "number" ? Math.min(Math.max(body.limit, 1), 25) : 8;

    const searchResponse = await searchMemories({
      query,
      memoryType,
      actorType,
      category,
      productId,
      limit,
    });

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error("[Memory Search API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        results: [],
        total: 0,
        query: "",
        source: "fallback",
        error: error instanceof Error ? error.message : "Search error",
      },
      { status: 500 }
    );
  }
}
