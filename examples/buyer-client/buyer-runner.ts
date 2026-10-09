/**
 * External AI Buyer Shopping Assistant Runner
 *
 * Simulates a buyer saying:
 * "Find me a programming laptop under $760, deliver within 5 days, prioritize price."
 */

import { ExternalBuyerShoppingAssistant } from "./buyer-shopping-assistant";

export async function runBuyerAssistantFlow() {
  console.log("===============================================================");
  console.log("🤖 PAYVIA BUYER NETWORK — EXTERNAL SHOPPING ASSISTANT RUNNER");
  console.log("===============================================================\n");

  const assistant = new ExternalBuyerShoppingAssistant("plat_default");

  console.log("▶ Prompt: \"Find me a programming laptop under $760, deliver within 5 days, prioritize price.\"\n");

  const result = await assistant.runAutonomousShopping({
    query: "programming laptop",
    maxBudget: 760.0,
    maxDeliveryDays: 5,
    priority: "PRICE",
    buyerId: "buyer_alex_dev",
  });

  console.log("  ✅ Step 1: ShoppingIntent Created & Validated");
  console.log(`     Intent ID: ${result.intent.id}`);
  console.log(`     Budget Ceiling: $${result.intent.constraints.maxTotal} USD (Strictly Private)`);
  console.log(`     Delivery Limit: ${result.intent.constraints.maxDeliveryDays} Days | Priority: ${result.intent.preferences?.priority}\n`);

  console.log("  ✅ Step 2 & 3: Candidates Discovered & Parallel Multi-Merchant Negotiations Formulated");
  console.log(`     Total Candidates Evaluated: ${result.rankedOffers.length}`);
  result.rankedOffers.forEach((offer, idx) => {
    const isNegotiated = offer.isNegotiable ? "● AI Negotiated" : "○ Discovery Only";
    console.log(
      `     [${idx + 1}] ${offer.productTitle.padEnd(32)} | ${offer.merchantName.padEnd(24)} | List: $${offer.listPrice} ➔ Final: $${offer.price} | Del: ${offer.deliveryDays}d | ${isNegotiated}`
    );
  });
  console.log("");

  console.log("  ✅ Step 4: Top Ranked Offer Selected Deterministically");
  console.log(`     Selected Product: ${result.selectedOffer.productTitle} (${result.selectedOffer.merchantName})`);
  console.log(`     Negotiated Price: $${result.selectedOffer.price} USD (Original: $${result.selectedOffer.listPrice}, Saved: $${result.selectedOffer.savings})\n`);

  console.log("  ✅ Step 5: Authoritative Transaction & Sealed Agreement Created");
  console.log(`     Transaction ID: ${result.transaction.id}`);
  console.log(`     Agreement ID: ${result.agreement.id}`);
  console.log(`     SHA-256 Seal: ${result.agreement.agreementHash}\n`);

  console.log("  ✅ Step 6: Human Approval & PayPal Settlement Rails Connected");
  console.log(`     Settlement Status: ${result.settlement.status}`);
  console.log(`     PayPal Amount Bound: $${result.settlement.amount} USD`);
  if (result.paypalApprovalUrl) {
    console.log(`     PayPal Checkout URL: ${result.paypalApprovalUrl}`);
  }

  console.log("\n===============================================================");
  console.log("🎉 PAYVIA BUYER NETWORK PROGRAMMATIC FLOW COMPLETED!");
  console.log("===============================================================\n");

  return {
    success: true,
    intentId: result.intent.id,
    sessionId: result.session.id,
    transactionId: result.transaction.id,
    agreementId: result.agreement.id,
    settlementId: result.settlement.id,
  };
}
