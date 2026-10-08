import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { AgentMessage, AgentProposalOutput, BuyerConstraints } from "@/types/agent";
import { Product } from "@/types/product";
import { BUYER_AGENT_SYSTEM_PROMPT } from "./prompts";
import { generateId } from "@/lib/utils";
import { env } from "@/lib/config/env";
import { getBuyerContextForNegotiation } from "@/lib/memory/buyer-memory";
import { buildPromptMemoryBlock } from "@/lib/memory/memory-context";

export async function evaluateBuyerTurn(params: {
  product: Product;
  constraints: BuyerConstraints;
  history: AgentMessage[];
  lastMerchantOffer?: number;
  round: number;
}): Promise<AgentMessage> {
  const { product, constraints, history, lastMerchantOffer, round } = params;

  let proposal: AgentProposalOutput | null = null;

  if (env.googleGenerativeAiApiKey) {
    try {
      // 1. Query Elasticsearch Serverless Memory Layer
      const buyerMemory = await getBuyerContextForNegotiation(product, constraints);
      const memoryBlock = buyerMemory.hasMemory
        ? buildPromptMemoryBlock(buyerMemory.memories, "BUYER HISTORICAL MEMORY")
        : "";

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

Buyer Constraints:
- Hard Maximum Budget: $${constraints.maxBudget.toFixed(2)}
- Ideal Target Price: $${constraints.targetPrice.toFixed(2)}
- Maximum Acceptable Delivery Time: ${constraints.maxDeliveryDays} days
${constraints.notes ? `- Special Instructions: ${constraints.notes}` : ""}

${memoryBlock}

Negotiation State:
- Current Round: ${round} of 5
- Last Merchant Offer: ${lastMerchantOffer ? `$${lastMerchantOffer.toFixed(2)}` : "None yet"}
- Dialogue History:
${historyContext || "No prior exchanges. You are making the opening proposal."}

Formulate your structured proposal JSON now.
`;

      const { text } = await generateText({
        model: google("gemini-3.8-flash"),
        system: BUYER_AGENT_SYSTEM_PROMPT,
        prompt: promptText,
        abortSignal: AbortSignal.timeout(6000),
        maxRetries: 0,
      });

      // Extract JSON from response
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
            deliveryDays: typeof parsed.deliveryDays === "number" ? parsed.deliveryDays : constraints.maxDeliveryDays,
            message: String(parsed.message || ""),
            reasoning: String(parsed.reasoning || ""),
          };
        }
      }
    } catch (error) {
      console.warn("[BuyerAgent] Gemini generation failed, using strategic bounded fallback:", error);
    }
  }

  // Strategic deterministic fallback if LLM is unavailable or unparseable
  if (!proposal) {
    if (round === 1) {
      const openPrice = Math.min(constraints.targetPrice, constraints.maxBudget * 0.85);
      proposal = {
        action: "PROPOSE",
        proposedPrice: Number(openPrice.toFixed(2)),
        deliveryDays: constraints.maxDeliveryDays,
        message: `Hello! I represent a verified buyer ready to purchase "${product.name}". We propose $${openPrice.toFixed(2)} with ${constraints.maxDeliveryDays}-day delivery.`,
        reasoning: "Anchoring near target price to establish a favorable negotiation baseline.",
      };
    } else if (lastMerchantOffer && lastMerchantOffer <= constraints.maxBudget) {
      if (lastMerchantOffer <= constraints.targetPrice * 1.05 || round >= 3) {
        proposal = {
          action: "ACCEPT",
          proposedPrice: Number(lastMerchantOffer.toFixed(2)),
          deliveryDays: Math.min(3, constraints.maxDeliveryDays),
          message: `The buyer accepts the merchant's offer of $${lastMerchantOffer.toFixed(2)}. We have an agreed deal!`,
          reasoning: "Merchant counter-offer meets our budget and delivery expectations.",
        };
      } else {
        const counter = Math.min(
          constraints.maxBudget,
          Number(((constraints.targetPrice + lastMerchantOffer) / 2).toFixed(2))
        );
        proposal = {
          action: "COUNTER",
          proposedPrice: counter,
          deliveryDays: constraints.maxDeliveryDays,
          message: `We can increase our offer to $${counter.toFixed(2)} with standard delivery. Can we finalize at this price?`,
          reasoning: "Splitting the difference towards merchant counter while staying below ceiling budget.",
        };
      }
    } else {
      const highestBid = Math.min(constraints.maxBudget, product.originalPrice * 0.9);
      proposal = {
        action: "COUNTER",
        proposedPrice: Number(highestBid.toFixed(2)),
        deliveryDays: constraints.maxDeliveryDays,
        message: `Our maximum budget for "${product.name}" is $${highestBid.toFixed(2)}. This is our best and final offer.`,
        reasoning: "Bidding at maximum allowable budget limit.",
      };
    }
  }

  // STRICT BACKEND CONSTRAINT ENFORCEMENT (Cannot be overridden by AI)
  const boundedPrice = Math.min(proposal.proposedPrice, constraints.maxBudget);
  const boundedDelivery = Math.min(proposal.deliveryDays, constraints.maxDeliveryDays);

  return {
    id: generateId("msg_buyer"),
    sender: "buyer",
    timestamp: new Date().toISOString(),
    content: proposal.message,
    proposedPrice: Number(boundedPrice.toFixed(2)),
    deliveryDays: boundedDelivery,
    decision: proposal.action,
    reasoning: proposal.reasoning,
  };
}
