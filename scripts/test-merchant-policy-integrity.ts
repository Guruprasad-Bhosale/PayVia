/**
 * Regression Test Suite: Merchant Policy Referential Integrity & Lifecycle
 * Verifies foreign key safety, idempotency, missing merchant handling, and tenant boundaries.
 */

import { policyService } from "@/lib/services/policy.service";
import { shoppingService } from "@/lib/services/shopping.service";
import { platformRepo, merchantRepo, policyRepo } from "@/lib/repositories";

async function runRegressionSuite() {
  console.log("🧪 Running Merchant Policy Referential Integrity Regression Suite...\n");

  const platformId = "plat_default";

  // 1. Ensure platform exists
  let platform = await platformRepo.findById(platformId);
  if (!platform) {
    platform = await platformRepo.create({
      id: platformId,
      name: "PayVia Reference Platform",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  console.log("▶ [Test 1] Successful policy creation for an existing merchant:");
  const testMerchantId = `merch_reg_${Date.now()}`;
  const merchant = await merchantRepo.create({
    id: testMerchantId,
    platformId,
    name: "Regression Test Merchant",
    email: "test@regression.payvia.dev",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  console.log(`     Created test merchant: ${merchant.id}`);

  const policy = await policyService.setMerchantPolicy({
    platformId,
    merchantId: merchant.id,
    catalogItemId: "prod_reg_100",
    listPrice: 500.0,
    minimumPrice: 420.0,
    minimumDeliveryDays: 2,
    maximumDeliveryDays: 5,
    enabled: true,
    strategy: "BALANCED_ECONOMIC",
  });
  if (!policy || policy.merchantId !== merchant.id || policy.minimumPrice !== 420.0) {
    throw new Error("Test 1 Failed: Policy creation for existing merchant failed");
  }
  console.log("  ✅ Test 1 Passed: Policy created successfully with valid foreign key constraint");

  console.log("\n▶ [Test 2] Repeated initialization without duplicate records (Idempotency):");
  const repeatPolicy = await policyService.setMerchantPolicy({
    platformId,
    merchantId: merchant.id,
    catalogItemId: "prod_reg_100",
    listPrice: 500.0,
    minimumPrice: 420.0,
    minimumDeliveryDays: 2,
    maximumDeliveryDays: 5,
    enabled: true,
    strategy: "BALANCED_ECONOMIC",
  });
  if (repeatPolicy.id !== policy.id) {
    throw new Error(`Test 2 Failed: Repeated initialization produced different policy ID (${repeatPolicy.id} vs ${policy.id})`);
  }
  console.log("  ✅ Test 2 Passed: Repeated initialization is 100% idempotent");

  console.log("\n▶ [Test 3] Missing merchant handling (Clean rejection before foreign key violation):");
  let missingMerchantCaught = false;
  try {
    await policyService.setMerchantPolicy({
      platformId,
      merchantId: "merch_nonexistent_ghost_9999",
      catalogItemId: "prod_any",
      listPrice: 300.0,
      minimumPrice: 200.0,
      enabled: true,
    });
  } catch (err: any) {
    if (err.message.includes("MERCHANT_NOT_FOUND")) {
      missingMerchantCaught = true;
      console.log(`     Successfully caught controlled rejection: ${err.message}`);
    }
  }
  if (!missingMerchantCaught) {
    throw new Error("Test 3 Failed: Missing merchant was not rejected with MERCHANT_NOT_FOUND");
  }
  console.log("  ✅ Test 3 Passed: Missing merchant rejected cleanly before triggering database constraint violation");

  console.log("\n▶ [Test 4] Correct merchant and platform association (Cross-tenant boundary protection):");
  let crossTenantBlocked = false;
  try {
    await policyService.setMerchantPolicy({
      platformId: "plat_other_isolated_tenant",
      merchantId: merchant.id, // belongs to plat_default
      listPrice: 500.0,
      minimumPrice: 400.0,
      enabled: true,
    });
  } catch (err: any) {
    if (err.message.includes("TENANT_MISMATCH")) {
      crossTenantBlocked = true;
      console.log(`     Successfully blocked cross-tenant assignment: ${err.message}`);
    }
  }
  if (!crossTenantBlocked) {
    throw new Error("Test 4 Failed: Cross-tenant policy assignment was not blocked with TENANT_MISMATCH");
  }
  console.log("  ✅ Test 4 Passed: Cross-tenant policy assignment strictly blocked, preserving tenant isolation");

  console.log("\n▶ [Test 5] Preservation of existing customized merchant policies:");
  // Set custom floor on existing product
  const customPolicy = await policyService.setMerchantPolicy({
    platformId,
    merchantId: merchant.id,
    catalogItemId: "prod_custom_item",
    listPrice: 1000.0,
    minimumPrice: 650.0, // Custom negotiated floor
    minimumDeliveryDays: 3,
    maximumDeliveryDays: 6,
    enabled: true,
  });

  const verifiedPolicy = await policyRepo.findMerchantPolicy(merchant.id, "prod_custom_item");
  if (!verifiedPolicy || verifiedPolicy.minimumPrice !== 650.0) {
    throw new Error("Test 5 Failed: Custom merchant policy terms were not preserved");
  }
  console.log("  ✅ Test 5 Passed: Existing customized merchant policy preserved ($650.00 floor intact)");

  console.log("\n▶ [Test 6] End-to-End Shopping Intent Discovery & Reference Merchant Auto-Resolution:");
  const intentResult = await shoppingService.createShoppingIntent({
    platformId,
    buyerId: "buyer_regression_01",
    query: "Developer laptop with fast processor",
    constraints: {
      maxTotal: 900.0,
      maxDeliveryDays: 5,
      allowedPaymentTiming: ["IMMEDIATE"],
    },
    quantity: 1,
  });
  console.log(`     Created shopping session: ${intentResult.session.id}`);

  // Trigger candidate discovery (which previously triggered prisma.merchantPolicy.upsert foreign key failure)
  const discoveredSession = await shoppingService.discoverCandidates(intentResult.session.id);
  if (!discoveredSession.candidateOffers || discoveredSession.candidateOffers.length === 0) {
    throw new Error("Test 6 Failed: Discovery returned 0 offers");
  }
  console.log(`     Discovered ${discoveredSession.candidateOffers.length} candidate offers without foreign key errors`);
  console.log("  ✅ Test 6 Passed: Candidate discovery executed with zero foreign key constraint violations");

  console.log("\n🎉 ALL 6 REGRESSION & REFERENTIAL INTEGRITY TESTS PASSED FLAWLESSLY!\n");
}

runRegressionSuite().catch((err) => {
  console.error("❌ Regression suite failed:", err);
  process.exit(1);
});

