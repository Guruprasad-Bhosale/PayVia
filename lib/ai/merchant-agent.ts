import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { AgentMessage, AgentProposalOutput, MerchantConstraints } from "@/types/agent";
import { Product } from "@/types/product";
import { MERCHANT_AGENT_SYSTEM_PROMPT } from "./prompts";
import { generateId } from "@/lib/utils";
import { env } from "@/lib/config/env";

export async function evaluateMerchantTurn(params: {
  product: Product;
  constraints: MerchantConstraints;
  history: AgentMessage[];
  lastBuyerMessage: AgentMessage;
  round: number;
}): Promise<AgentMessage> {
  const { product, constraints, history, lastBuyerMessage, round } = params;

  let proposal: AgentProposalOutput | null = null;

  if (env.googleGenerativeAiApiKey) {
    try {
      const historyContext = history
        .map(
          (m) =>
            `${m.sender.toUpperCase()}: ${m.content} [Offered: $${m.proposedPrice}, Delivery: ${m.deliveryDays}d, Action: ${m.decision}]`
        )
        .join("\n");

      const promptText = `
Product Details:
- Name: "${product.name}"
- Original List Price: $${product.originalPrice.toFixed(2)}
- Description: ${product.description}
- Key Features: ${product.features.join(", ")}

Merchant Store Constraints:
- Protected Minimum Floor Price: $${constraints.minAcceptablePrice.toFixed(2)} (NEVER go below this)
- Original Listing Price: $${constraints.originalPrice.toFixed(2)}

Negotiation State:
- Current Round: ${round} of 5
- Latest Buyer Offer: $${lastBuyerMessage.proposedPrice.toFixed(2)} (${lastBuyerMessage.deliveryDays} days delivery)
- Latest Buyer Message: "${lastBuyerMessage.content}"
- Dialogue History:
${historyContext}

Formulate your structured merchant response JSON now.
`;

      const { text } = await generateText({
        model: google("gemini-3.8-flash"),
        system: MERCHANT_AGENT_SYSTEM_PROMPT,
        prompt: promptText,
        abortSignal: AbortSignal.timeout(6000),
        maxRetries: 0,
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (
          parsed &&
          typeof parsed.proposedPrice === "number" &&
          ["PROPOSE", "COUNTER", "ACCEPT", "REJECT"].includes(parsed.action)
        ) {
          proposal = {
            action: parsed.action,
            proposedPrice: Number(parsed.proposedPrice.toFixed(2)),
            deliveryDays: typeof parsed.deliveryDays === "number" ? parsed.deliveryDays : 3,
            message: String(parsed.message || ""),
            reasoning: String(parsed.reasoning || ""),
          };
        }
      }
    } catch (error) {
      console.warn("[MerchantAgent] Gemini generation failed, using strategic bounded fallback:", error);
    }
  }

  // Strategic deterministic fallback if LLM is unavailable or unparseable
  if (!proposal) {
    const buyerBid = lastBuyerMessage.proposedPrice;

    if (buyerBid >= constraints.minAcceptablePrice * 1.02 && (round >= 2 || buyerBid >= product.originalPrice * 0.9)) {
      proposal = {
        action: "ACCEPT",
        proposedPrice: Number(buyerBid.toFixed(2)),
        deliveryDays: Math.min(lastBuyerMessage.deliveryDays, 3),
        message: `We accept your offer of $${buyerBid.toFixed(2)}! We will expedite handling for your order.`,
        reasoning: "Buyer offer meets target margin above floor price.",
      };
    } else {
      // Offer concession between original price and floor
      const concessionStep = (product.originalPrice - constraints.minAcceptablePrice) * (0.6 - round * 0.1);
      const counterPrice = Math.max(
        constraints.minAcceptablePrice,
        Number((constraints.minAcceptablePrice + concessionStep).toFixed(2))
      );

      if (buyerBid >= counterPrice) {
        proposal = {
          action: "ACCEPT",
          proposedPrice: Number(buyerBid.toFixed(2)),
          deliveryDays: 3,
          message: `Deal agreed! We accept $${buyerBid.toFixed(2)} with complimentary express shipping.`,
          reasoning: "Buyer proposal matches or exceeds our concession floor.",
        };
      } else {
        proposal = {
          action: "COUNTER",
          proposedPrice: counterPrice,
          deliveryDays: 3,
          message: `Thank you for your proposal. While we cannot meet $${buyerBid.toFixed(2)}, we can offer $${counterPrice.toFixed(2)} with premium delivery.`,
          reasoning: "Offering midpoint price discount while defending store margin.",
        };
      }
    }
  }

  // STRICT BACKEND FLOOR PROTECTION (Cannot be overridden by AI)
  const boundedPrice = Math.max(proposal.proposedPrice, constraints.minAcceptablePrice);

  return {
    id: generateId("msg_merchant"),
    sender: "merchant",
    timestamp: new Date().toISOString(),
    content: proposal.message,
    proposedPrice: Number(boundedPrice.toFixed(2)),
    deliveryDays: proposal.deliveryDays || 3,
    decision: proposal.action,
    reasoning: proposal.reasoning,
  };
}
