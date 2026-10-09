import { NextRequest, NextResponse } from "next/server";
import { startNegotiationRequestSchema } from "@/lib/validation/negotiation";
import { getProductById } from "@/data/products";
import { runNegotiation } from "@/lib/ai/negotiation-engine";
import { getNegotiationAgreement, getNegotiationSession } from "@/lib/ai/negotiation-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/negotiate
 * Initiates an autonomous AI negotiation session between Buyer and Merchant agents.
 * Validates inputs, executes multi-turn bargaining, and saves the verified agreement.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = startNegotiationRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid negotiation parameters",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { productId, buyerConstraints } = parseResult.data;
    const product = getProductById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, error: `Product with ID '${productId}' not found in catalog.` },
        { status: 404 }
      );
    }

    const session = await runNegotiation(product, buyerConstraints);

    return NextResponse.json({
      success: true,
      session,
      agreement: session.agreement,
    });
  } catch (error) {
    console.error("[Negotiation API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process autonomous negotiation",
        message: error instanceof Error ? error.message : "Internal error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/negotiate?id=<negotiationId>
 * Retrieves an existing negotiation session or agreement.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing required 'id' query parameter" },
      { status: 400 }
    );
  }

  const session = getNegotiationSession(id);
  let agreement = getNegotiationAgreement(id);

  if (!session && !agreement) {
    // Check domain repository for agreements created via shopping service
    try {
      const { agreementRepo } = await import("@/lib/repositories");
      const domainAg = await agreementRepo.findById(id);
      if (domainAg) {
        agreement = {
          id: domainAg.id,
          negotiationId: domainAg.negotiationId,
          productId: domainAg.items[0]?.catalogItemId || "item_1",
          productName: domainAg.items[0]?.title || "Negotiated Item",
          originalPrice: domainAg.originalPrice,
          finalPrice: domainAg.finalPrice,
          savings: domainAg.savings,
          deliveryDays: domainAg.deliveryDays,
          buyerMaxPrice: domainAg.finalPrice,
          buyerMaxDeliveryDays: domainAg.deliveryDays,
          merchantMinPrice: domainAg.finalPrice,
          currency: domainAg.currency,
          status: domainAg.status === "SETTLED" || domainAg.status === "ACCEPTED" ? "AGREED" : "FAILED",
          roundsCount: 1,
          createdAt: domainAg.createdAt,
          userApproved: domainAg.userApproved ?? false,
          userApprovedAt: domainAg.userApprovedAt,
          termsSummary: `Negotiated price of $${domainAg.finalPrice} USD with ${domainAg.deliveryDays}-day delivery.`,
          finalAgreedPrice: domainAg.finalPrice,
          savingsAmount: domainAg.savings,
          totalSettlementAmount: domainAg.finalPrice,
        };
      }
    } catch {
      // Fallback
    }
  }

  if (!session && !agreement) {
    return NextResponse.json(
      { success: false, error: `Negotiation '${id}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    session: session || null,
    agreement: agreement || session?.agreement || null,
  });
}
