import { evaluateBuyerTurn } from "./buyer-agent";
import { evaluateMerchantTurn } from "./merchant-agent";
import { saveNegotiationSession } from "./negotiation-store";
import { AgentMessage, BuyerConstraints } from "@/types/agent";
import { NegotiationAgreement, NegotiationSession } from "@/types/negotiation";
import { Product } from "@/types/product";
import { generateId } from "@/lib/utils";

/**
 * Multi-Turn Autonomous Negotiation Orchestrator.
 * Coordinates Gemini-powered dialogue between Buyer Agent and Merchant Agent,
 * enforcing mathematical hard constraints and saving validated agreements for PayPal execution.
 */
export async function runNegotiation(
  product: Product,
  buyerConstraints: BuyerConstraints
): Promise<NegotiationSession> {
  const sessionId = generateId("sess");
  const maxRounds = 4;
  const messages: AgentMessage[] = [];

  const merchantConstraints = {
    originalPrice: product.originalPrice,
    minAcceptablePrice: product.minAcceptablePrice,
    shippingFloorPrice: 0,
    maxRoundsAllowed: maxRounds,
  };

  let agreementReached = false;
  let agreedPrice = 0;
  let agreedDeliveryDays = buyerConstraints.maxDeliveryDays;

  // Multi-turn negotiation loop
  for (let round = 1; round <= maxRounds; round++) {
    // 1. Buyer Agent Turn
    const lastMerchantMsg = messages.filter((m) => m.sender === "merchant").pop();
    const buyerMsg = await evaluateBuyerTurn({
      product,
      constraints: buyerConstraints,
      history: [...messages],
      lastMerchantOffer: lastMerchantMsg?.proposedPrice,
      round,
    });
    messages.push(buyerMsg);

    if (buyerMsg.decision === "ACCEPT" && lastMerchantMsg) {
      agreementReached = true;
      agreedPrice = lastMerchantMsg.proposedPrice;
      agreedDeliveryDays = buyerMsg.deliveryDays;
      break;
    }

    // 2. Merchant Agent Turn
    const merchantMsg = await evaluateMerchantTurn({
      product,
      constraints: merchantConstraints,
      history: [...messages],
      lastBuyerMessage: buyerMsg,
      round,
    });
    messages.push(merchantMsg);

    if (merchantMsg.decision === "ACCEPT") {
      agreementReached = true;
      agreedPrice = buyerMsg.proposedPrice;
      agreedDeliveryDays = merchantMsg.deliveryDays;
      break;
    }

    // Check if proposals naturally converged
    if (buyerMsg.proposedPrice >= merchantMsg.proposedPrice) {
      agreementReached = true;
      agreedPrice = merchantMsg.proposedPrice;
      agreedDeliveryDays = Math.min(buyerMsg.deliveryDays, merchantMsg.deliveryDays);
      break;
    }
  }

  // If after max rounds prices are close and within bounds, finalize convergence
  if (!agreementReached && messages.length > 0) {
    const lastBuyer = messages.filter((m) => m.sender === "buyer").pop();
    const lastMerchant = messages.filter((m) => m.sender === "merchant").pop();

    if (lastBuyer && lastMerchant) {
      const midpoint = Number(((lastBuyer.proposedPrice + lastMerchant.proposedPrice) / 2).toFixed(2));
      if (midpoint <= buyerConstraints.maxBudget && midpoint >= product.minAcceptablePrice) {
        agreementReached = true;
        agreedPrice = midpoint;
        agreedDeliveryDays = Math.min(lastBuyer.deliveryDays, lastMerchant.deliveryDays);

        messages.push({
          id: generateId("msg_merchant"),
          sender: "merchant",
          timestamp: new Date().toISOString(),
          content: `We have reached consensus at $${midpoint.toFixed(2)} with ${agreedDeliveryDays}-day delivery!`,
          proposedPrice: midpoint,
          deliveryDays: agreedDeliveryDays,
          decision: "ACCEPT",
          reasoning: "Final round convergence within acceptable floor margin.",
        });
      }
    }
  }

  let finalAgreement: NegotiationAgreement | undefined = undefined;

  if (agreementReached && agreedPrice > 0) {
    // STRICT BACKEND CONSTRAINT ENFORCEMENT & SAVINGS CALCULATION
    const validatedFinalPrice = Math.min(
      Math.max(Number(agreedPrice.toFixed(2)), product.minAcceptablePrice),
      buyerConstraints.maxBudget
    );

    const calculatedSavings = Number((product.originalPrice - validatedFinalPrice).toFixed(2));

    const agreementId = generateId("agree");

    finalAgreement = {
      id: agreementId,
      negotiationId: sessionId,
      productId: product.id,
      productName: product.name,
      originalPrice: product.originalPrice,
      finalPrice: validatedFinalPrice,
      savings: calculatedSavings,
      deliveryDays: agreedDeliveryDays,
      buyerMaxPrice: buyerConstraints.maxBudget,
      buyerMaxDeliveryDays: buyerConstraints.maxDeliveryDays,
      merchantMinPrice: product.minAcceptablePrice,
      currency: product.currency || "USD",
      status: "AGREED",
      roundsCount: messages.length,
      createdAt: new Date().toISOString(),
      userApproved: false,
      termsSummary: `Buyer Agent negotiated final purchase price of $${validatedFinalPrice.toFixed(
        2
      )} ${product.currency} (saving $${calculatedSavings.toFixed(
        2
      )}) with ${agreedDeliveryDays}-day delivery. Terms verified by PayVia backend.`,
      // Backward compatibility aliases:
      finalAgreedPrice: validatedFinalPrice,
      savingsAmount: calculatedSavings,
      totalSettlementAmount: validatedFinalPrice,
    };
  }

  const session: NegotiationSession = {
    id: sessionId,
    product,
    buyerConstraints,
    merchantConstraints,
    status: agreementReached ? "AGREED" : "FAILED",
    currentRound: messages.length,
    maxRounds,
    messages,
    agreement: finalAgreement,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Persist session and agreement to server store for anti-tampering verification
  saveNegotiationSession(session);

  // Asynchronously index negotiation memory into Elasticsearch Serverless
  import("@/lib/elastic/indexer")
    .then(({ indexNegotiationSession }) => {
      indexNegotiationSession(session).catch(() => {});
    })
    .catch(() => {});

  return session;
}

// Alias for initial scaffold compatibility
export const createNegotiationSession = runNegotiation;
