import { AgentMessage, BuyerConstraints } from "@/types/agent";
import { Product } from "@/types/product";
import { generateId } from "@/lib/utils";

/**
 * Buyer AI Agent placeholder module.
 *
 * TODO: [AI Hackathon Integration] Connect with LLM provider (OpenAI / Gemini / Anthropic)
 * to evaluate buyer utility function, analyze merchant counter-proposals, and formulate dynamic offers.
 */
export async function evaluateBuyerTurn(params: {
  product: Product;
  constraints: BuyerConstraints;
  history: AgentMessage[];
  round: number;
}): Promise<AgentMessage> {
  const { product, constraints, round } = params;

  // Placeholder logic simulating buyer agent step
  const initialOffer = Math.max(
    constraints.targetPrice,
    constraints.maxBudget * 0.8
  );

  return {
    id: generateId("msg_buyer"),
    sender: "buyer",
    timestamp: new Date().toISOString(),
    content: `Hello! I am representing a buyer interested in "${product.name}". We are ready to purchase immediately at $${initialOffer.toFixed(2)} with standard delivery.`,
    proposedPrice: Number(initialOffer.toFixed(2)),
    proposedDeliveryOptionId: product.availableDeliveryOptions[0]?.id || "standard",
    decision: round === 1 ? "PROPOSE" : "COUNTER",
    reasoning: "Starting near target budget while leaving room for minor concession.",
  };
}
