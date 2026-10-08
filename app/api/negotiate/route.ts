import { NextRequest, NextResponse } from "next/server";
import { startNegotiationRequestSchema } from "@/lib/validation/negotiation";
import { getProductById } from "@/data/products";
import { createNegotiationSession } from "@/lib/ai/negotiation-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/negotiate
 * Initiates an AI negotiation session between Buyer and Merchant agents.
 *
 * TODO: [AI Hackathon Integration] Connect persistent session store and dynamic multi-round engine.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = startNegotiationRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid negotiation request",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { productId, buyerConstraints } = parseResult.data;
    const product = getProductById(productId);

    if (!product) {
      return NextResponse.json(
        { error: `Product with ID '${productId}' not found.` },
        { status: 404 }
      );
    }

    const session = await createNegotiationSession(product, buyerConstraints);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Negotiation API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process negotiation session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
