#!/usr/bin/env node

/**
 * PayVia Automated Negotiation & Payment Verification Test Suite
 */

import {
  testSuccessfulNegotiation,
  testPriceTamperingPrevention,
} from "../tests/negotiation/negotiation.test.js";
import {
  testPayPalOrderAmountIntegrity,
  testPhase4PaymentLifecycleInvariants,
} from "../tests/paypal/paypal.test.js";

async function runAllTests() {
  console.log("🧪 Running PayVia Negotiation & Payment Test Suite...\n");

  try {
    console.log("▶ Running Negotiation Invariant Tests:");
    await testSuccessfulNegotiation();

    console.log("\n▶ Running Anti-Tampering & Security Constraint Tests:");
    testPriceTamperingPrevention();

    console.log("\n▶ Running PayPal Order Amount & Agreement Linking Tests:");
    testPayPalOrderAmountIntegrity();

    console.log("\n▶ Running Phase 4 Payment Lifecycle & Safety Invariants:");
    testPhase4PaymentLifecycleInvariants();

    console.log("\n✨ All test requirements PASSED successfully!\n");
  } catch (error) {
    console.error("\n❌ Test Suite Failed:", error);
    process.exit(1);
  }
}

runAllTests();
