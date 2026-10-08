import { AgentMessage, MerchantConstraints } from "@/types/agent";
import { Product } from "@/types/product";
import { generateId } from "@/lib/utils";

/**
 * Merchant AI Agent placeholder module.
 *
 * TODO: [AI Hackathon Integration] Implement merchant pricing strategy, inventory dynamics,
 * shipping margin protections, and LLM-driven counter-arguments.
 */
export async function evaluateMerchantTurn(params: {
  product: Product;
  constraints: MerchantConstraints;
  history: AgentMessage[];
  lastBuyerMessage: AgentMessage;
  round: number;
}): Promise<AgentMessage> {
  const { product, constraints } = params;

  // Placeholder logic simulating merchant agent counter-offer
  const counterPrice = Math.max(
    constraints.minAcceptablePrice,
    product.originalPrice * 0.9
  );

  return {
    id: generateId("msg_merchant"),
    sender: "merchant",
    timestamp: new Date().toISOString(),
    content: `Thank you for your offer. While we cannot meet that exact price, we can offer "${product.name}" for $${counterPrice.toFixed(2)} with complimentary express handling.`,
    proposedPrice: Number(counterPrice.toFixed(2)),
    proposedDeliveryOptionId: product.availableDeliveryOptions[0]?.id || "standard",
    decision: "COUNTER",
    reasoning: "Maintaining margin above floor while providing an attractive bundle.",
  };
}
