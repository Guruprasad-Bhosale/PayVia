import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchProducts } from "@/lib/channel3/search";

export const dynamic = "force-dynamic";

const searchRequestSchema = z.object({
  query: z.string().min(1, "Search query is required").max(300, "Query is too long"),
  limit: z.number().int().min(1).max(20).optional().default(8),
  fallbackOnFailure: z.boolean().optional().default(true),
});

/**
 * POST /api/products/search
 * Authenticated product discovery endpoint powered by Channel3 Product Data API.
 */
export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const parseResult = searchRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid search parameters.",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { query, limit, fallbackOnFailure } = parseResult.data;

    const result = await searchProducts(query, { limit, fallbackOnFailure });

    return NextResponse.json({
      success: result.success,
      source: result.source,
      products: result.products,
      totalResults: result.totalResults,
      message: result.message,
      ...(result.error ? { error: result.error } : {}),
    });
  } catch (error: unknown) {
    console.error("[Products Search API Route Error]:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to search products at this time. Please try again.",
      },
      { status: 500 }
    );
  }
}
