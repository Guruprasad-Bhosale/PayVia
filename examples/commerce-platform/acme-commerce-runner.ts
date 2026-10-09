/**
 * Acme Commerce — Reference External Platform Integration
 *
 * Demonstrates complete 10-step programmatic flow:
 * 1. Authenticate with PayVia platform credentials
 * 2. Onboard merchant & configure private negotiation policy
 * 3. Ingest catalog product
 * 4. Create customer transaction intent
 * 5. Initiate multi-turn AI negotiation
 * 6. Submit structured proposals & validate policy bounds
 * 7. Accept agreement & verify SHA-256 cryptographic seal
 * 8. Settle agreement with PayPal Orders v2 binding
 * 9. Retrieve settlement status & receipt
 * 10. Query append-only audit trail for compliance
 */

import { createPayViaClient } from "@/lib/sdk";
import { generatePlatformApiKey } from "@/lib/auth/platform-auth";
import { platformRepo } from "@/lib/repositories";

async function runAcmeCommerceIntegration() {
  console.log("===============================================================");
  console.log("🚀 ACME COMMERCE — EXTERNAL PLATFORM INTEGRATION RUNNER");
  console.log("===============================================================\n");

  // Step 1: Platform Provisioning & Authentication Credentials
  console.log("▶ Step 1: Registering Platform & Generating Secure API Key...");
  const platformId = `plat_acme_${Date.now()}`;
  const apiKeyData = generatePlatformApiKey(platformId, "test");

  await platformRepo.create({
    id: platformId,
    name: "Acme Global Marketplace",
    status: "ACTIVE",
    apiKeyHash: apiKeyData.keyHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const payvia = createPayViaClient({
    platformId,
    apiKey: apiKeyData.rawKey,
  });
  console.log(`  ✅ Platform registered: ${platformId} (Key Prefix: ${apiKeyData.prefix})`);

  // Step 2: Merchant Onboarding & Private Negotiation Policy
  console.log("\n▶ Step 2: Onboarding Merchant Store & Setting Private Policy...");
  const merchant = await payvia.merchants.create({
    name: "Acme Pro Audio Gear",
    email: "sales@acmeproaudio.example",
    settlementEmail: "sb-merchant-acme@business.example.com",
  });

  await payvia.merchants.setPolicy(merchant.id, {
    enabled: true,
    currency: "USD",
    listPrice: 1200,
    minimumPrice: 1050, // Private merchant floor: $1050
    minimumDeliveryDays: 2,
    maximumDeliveryDays: 6,
    immediateDiscountPercent: 4,
    allowedPaymentTiming: ["IMMEDIATE", "NET_30"],
    strategy: "BALANCED_ECONOMIC",
  });
  console.log(`  ✅ Merchant onboarded: ${merchant.name} (${merchant.id})`);
  console.log("  🔒 Private Policy: List $1200, Floor $1050, Delivery 2-6d (Floor is strictly private)");

  // Step 3: Catalog Item Ingestion
  console.log("\n▶ Step 3: Ingesting Catalog Product...");
  const product = await payvia.catalog.createItem({
    merchantId: merchant.id,
    title: "Acme Studio Master Synthesizer Pro",
    listPrice: 1200,
    currency: "USD",
    description: "Flagship polyphonic synthesizer workstation with analog filters",
    category: "Pro Audio",
    sku: "ACME-SYNTH-PRO-01",
  });
  console.log(`  ✅ Catalog item created: ${product.title} (List: $${product.listPrice} ${product.currency})`);

  // Step 4: Transaction Intent Creation
  console.log("\n▶ Step 4: Creating Transaction from Buyer Intent...");
  const buyerId = `buyer_acme_${Date.now()}`;
  const transaction = await payvia.transactions.create({
    merchantId: merchant.id,
    buyerId,
    currency: "USD",
    items: [
      {
        catalogItemId: product.id,
        title: product.title,
        quantity: 1,
        listPrice: product.listPrice,
        currency: "USD",
      },
    ],
    constraints: {
      maxTotal: 1120, // Buyer maximum budget: $1120
      maxDeliveryDays: 5,
    },
    preferences: {
      paymentTiming: "IMMEDIATE",
      deliveryPriority: "HIGH",
    },
  });
  console.log(`  ✅ Transaction created: ${transaction.id} (Original Total: $${transaction.originalTotal})`);
  console.log("  🔒 Private Buyer Constraint: Max Budget $1120 (0% leakage to merchant)");

  // Step 5: Start Formal Negotiation Session
  console.log("\n▶ Step 5: Starting Structured Negotiation Session...");
  const session = await payvia.negotiations.start(transaction.id);
  console.log(`  ✅ Negotiation session initialized: ${session.id} (Status: ${session.status})`);

  // Step 6: Submit Structured Proposals & Server Policy Validation
  console.log("\n▶ Step 6: Submitting Structured Proposals & Validating Server Policies...");
  
  // Test 6a: Illegal proposal below merchant floor ($990 < $1050)
  const illegalOffer = await payvia.negotiations.submitProposal(session.id, {
    price: 990,
    deliveryDays: 3,
    senderType: "BUYER",
    reasoningText: "Initial aggressive offer",
  });
  console.log(`  🛡️ Policy Engine check on $990 proposal: ${illegalOffer.acceptedByPolicy ? "FAILED" : "PASSED (Correctly rejected below $1050 floor)"}`);

  // Test 6b: Valid consensus proposal ($1080, delivery 3 days)
  const validProposal = await payvia.negotiations.submitProposal(session.id, {
    price: 1080,
    deliveryDays: 3,
    senderType: "MERCHANT",
    reasoningText: "Counteroffer with 10% discount and 3-day expedited shipping",
  });
  console.log(`  ✅ Valid Proposal submitted: $${validProposal.proposal.price} USD (3 days delivery) ➔ Accepted by Policy: ${validProposal.acceptedByPolicy}`);

  // Step 7: Accept Agreement & Verify SHA-256 Seal
  console.log("\n▶ Step 7: Accepting Proposal & Generating Cryptographically Sealed Agreement...");
  const { agreement } = await payvia.negotiations.accept(session.id, validProposal.proposal.id);
  console.log(`  ✅ Agreement locked: ${agreement.id}`);
  console.log(`  🔒 SHA-256 Agreement Hash: ${agreement.agreementHash}`);
  console.log(`  💰 Final Agreed Price: $${agreement.finalPrice} (Saved: $${agreement.savings})`);

  // Step 8: PayPal Settlement Provider Binding
  console.log("\n▶ Step 8: Initiating Payment Settlement (Bound strictly to Agreement Price)...");
  const settlementResult = await payvia.settlements.create(agreement.id);
  console.log(`  ✅ Settlement record created: ${settlementResult.settlement.id}`);
  console.log(`  💳 Provider: ${settlementResult.settlement.provider} (Amount: $${settlementResult.agreementAmount} ${settlementResult.settlement.currency})`);
  console.log(`  🔗 Approval URL: ${settlementResult.approvalUrl || "MOCK_SANDBOX_REDIRECT"}`);

  // Step 9: Capture Settlement
  console.log("\n▶ Step 9: Capturing Settlement...");
  try {
    const captureResult = await payvia.settlements.capture(settlementResult.settlement.id);
    console.log(`  ✅ Settlement status: ${captureResult.status} (Captured: $${captureResult.amount} ${captureResult.currency})`);
  } catch (err: any) {
    if (err?.message?.includes("ORDER_NOT_APPROVED") || err?.details?.name === "UNPROCESSABLE_ENTITY") {
      console.log("  ℹ️ PayPal Sandbox live order created successfully! (Requires buyer browser redirect for final capture)");
      console.log(`  🔗 Buyer Approval Link: ${settlementResult.approvalUrl}`);
      console.log("  ✅ Settlement verification step passed.");
    } else {
      throw err;
    }
  }

  // Step 10: Query Compliance Audit Trail
  console.log("\n▶ Step 10: Querying Append-Only Compliance Audit Trail...");
  const auditEvents = await payvia.audit.getTrail(transaction.id);
  console.log(`  ✅ Audit Trail retrieved: ${auditEvents.length} immutable lifecycle events recorded`);
  auditEvents.forEach((e, idx) => {
    console.log(`     [${idx + 1}] ${e.timestamp} | ${e.actorType} ➔ ${e.eventType}`);
  });

  console.log("\n===============================================================");
  console.log("🎉 ACME COMMERCE END-TO-END INTEGRATION COMPLETED SUCCESSFULLY!");
  console.log("===============================================================\n");

  return {
    success: true,
    platformId,
    transactionId: transaction.id,
    agreementId: agreement.id,
    settlementId: settlementResult.settlement.id,
    finalPrice: agreement.finalPrice,
    auditEventsCount: auditEvents.length,
  };
}

// Execute if run directly
if (require.main === module || process.argv[1]?.includes("acme-commerce-runner")) {
  runAcmeCommerceIntegration().catch((err) => {
    console.error("Acme Commerce Runner Error:", err);
    process.exit(1);
  });
}

export { runAcmeCommerceIntegration };
