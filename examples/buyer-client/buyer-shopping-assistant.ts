/**
 * Reference External AI Buyer Shopping Assistant
 *
 * Demonstrates how an external AI client (e.g. ChatGPT plugin, autonomous shopping agent, or mobile assistant)
 * consumes PayVia negotiation infrastructure via the TypeScript SDK without accessing internal services.
 *
 * Flow:
 * 1. Initialize PayVia SDK client
 * 2. Create ShoppingIntent with buyer constraints & priority
 * 3. Discover candidates (PayVia-enabled vs discovery-only)
 * 4. Parallel negotiate with merchants
 * 5. Inspect ranked structured offers
 * 6. Select the best winning offer
 * 7. Approve agreement for PayPal Orders v2 settlement
 */

import { createPayViaClient, PayViaClient } from "@/lib/sdk";

export interface BuyerAssistantPrompt {
  query: string;
  maxBudget: number;
  maxDeliveryDays: number;
  priority: "PRICE" | "DELIVERY" | "BALANCED";
  buyerId?: string;
}

export class ExternalBuyerShoppingAssistant {
  private client: PayViaClient;

  constructor(platformId: string = "plat_default", apiKey?: string) {
    this.client = createPayViaClient({ platformId, apiKey });
  }

  async runAutonomousShopping(prompt: BuyerAssistantPrompt) {
    // 1. Create Buyer Shopping Intent
    const { intent, session } = await this.client.shopping.createIntent({
      buyerId: prompt.buyerId || "buyer_assistant_01",
      query: prompt.query,
      constraints: {
        maxTotal: prompt.maxBudget,
        maxDeliveryDays: prompt.maxDeliveryDays,
        allowedPaymentTiming: ["IMMEDIATE"],
      },
      preferences: {
        priority: prompt.priority,
        paymentTiming: "IMMEDIATE",
        notes: `Prioritize ${prompt.priority.toLowerCase()} optimization`,
      },
    });

    // 2. Discover Candidates
    const discoveredSession = await this.client.shopping.discover(session.id);

    // 3. Negotiate Parallel with PayVia-Enabled Merchants
    const negotiatedSession = await this.client.shopping.negotiate(discoveredSession.id);
    const rankedOffers = negotiatedSession.candidateOffers;

    // 4. Select Top Ranked Offer
    const topOffer = rankedOffers.find((o) => o.status === "OFFERED") || rankedOffers[0];
    if (!topOffer) {
      throw new Error("No suitable candidate offers available");
    }

    const { transaction, agreement } = await this.client.shopping.selectOffer(
      negotiatedSession.id,
      topOffer.id
    );

    // 5. Human Approval Gate
    const approvalResult = await this.client.shopping.approve(negotiatedSession.id);

    // 6. Initiate PayPal Orders v2 Settlement
    const settlementResult = await this.client.settlements.create(agreement.id);

    return {
      intent,
      session: approvalResult.session,
      selectedOffer: topOffer,
      rankedOffers,
      transaction,
      agreement: approvalResult.agreement,
      settlement: settlementResult.settlement,
      paypalApprovalUrl: settlementResult.approvalUrl,
    };
  }
}

export async function runBuyerAssistantFlow(options: {
  apiKey?: string;
  baseUrl?: string;
  platformId?: string;
  query: string;
  maxBudget: number;
  maxDeliveryDays: number;
  priority: "PRICE" | "DELIVERY" | "BALANCED";
  buyerId?: string;
}) {
  const assistant = new ExternalBuyerShoppingAssistant(options.platformId || "plat_default", options.apiKey);
  const res = await assistant.runAutonomousShopping({
    query: options.query,
    maxBudget: options.maxBudget,
    maxDeliveryDays: options.maxDeliveryDays,
    priority: options.priority,
    buyerId: options.buyerId,
  });
  return {
    success: true,
    ...res,
  };
}

