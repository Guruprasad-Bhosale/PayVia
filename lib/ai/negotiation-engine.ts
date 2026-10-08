import { evaluateBuyerTurn } from "./buyer-agent";
import { evaluateMerchantTurn } from "./merchant-agent";
import { BuyerConstraints } from "@/types/agent";
import { NegotiationSession } from "@/types/negotiation";
import { Product } from "@/types/product";
import { generateId } from "@/lib/utils";

/**
 * Negotiation Engine Orchestrator.
 * Coordinates multi-turn dialogue between Buyer Agent and Merchant Agent.
 *
 * TODO: [AI Hackathon Integration] Connect streamable event loop and agreement consensus validator.
 */
export async function createNegotiationSession(
  product: Product,
  buyerConstraints: BuyerConstraints
): Promise<NegotiationSession> {
  const sessionId = generateId("sess");

  const initialBuyerMsg = await evaluateBuyerTurn({
    product,
    constraints: buyerConstraints,
    history: [],
    round: 1,
  });

  const initialMerchantMsg = await evaluateMerchantTurn({
    product,
    constraints: {
      originalPrice: product.originalPrice,
      minAcceptablePrice: product.minAcceptablePrice,
      shippingFloorPrice: 0,
      maxRoundsAllowed: 5,
    },
    history: [initialBuyerMsg],
    lastBuyerMessage: initialBuyerMsg,
    round: 1,
  });

  return {
    id: sessionId,
    product,
    buyerConstraints,
    merchantConstraints: {
      originalPrice: product.originalPrice,
      minAcceptablePrice: product.minAcceptablePrice,
      shippingFloorPrice: 0,
      maxRoundsAllowed: 5,
    },
    status: "in_progress",
    currentRound: 1,
    maxRounds: 5,
    messages: [initialBuyerMsg, initialMerchantMsg],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
