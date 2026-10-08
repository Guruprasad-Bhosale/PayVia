import { SAMPLE_PRODUCTS } from "@/data/products";
import { runNegotiation } from "@/lib/ai/negotiation-engine";
import {
  saveNegotiationAgreement,
  validateAgreementForPayment,
} from "@/lib/ai/negotiation-store";
import { NegotiationAgreement } from "@/types/negotiation";

export async function testSuccessfulNegotiation() {
  const product = SAMPLE_PRODUCTS[0];
  const constraints = {
    maxBudget: 270,
    targetPrice: 240,
    maxDeliveryDays: 3,
  };

  const session = await runNegotiation(product, constraints);

  if (session.status !== "AGREED") {
    throw new Error(`Expected session status AGREED, received ${session.status}`);
  }
  if (!session.agreement) {
    throw new Error("Expected session to contain a final agreement");
  }

  const ag = session.agreement;
  // Test 1 & 5: Final price <= originalPrice
  if (ag.finalPrice > product.originalPrice) {
    throw new Error(`Final price ${ag.finalPrice} exceeds original price ${product.originalPrice}`);
  }
  // Test 2: Buyer maximum price validation
  if (ag.finalPrice > constraints.maxBudget) {
    throw new Error(`Final price ${ag.finalPrice} exceeds buyer max budget ${constraints.maxBudget}`);
  }
  // Test 3 & 6: Merchant minimum price validation
  if (ag.finalPrice < product.minAcceptablePrice) {
    throw new Error(`Final price ${ag.finalPrice} is below merchant floor ${product.minAcceptablePrice}`);
  }
  // Test 4: Delivery constraint validation
  if (ag.deliveryDays > constraints.maxDeliveryDays) {
    throw new Error(`Delivery days ${ag.deliveryDays} exceeds buyer max ${constraints.maxDeliveryDays}`);
  }

  console.log("  ✓ Test 1: Successful negotiation completed");
  console.log("  ✓ Test 2: Buyer maximum price strictly respected");
  console.log("  ✓ Test 3: Merchant floor price strictly protected");
  console.log("  ✓ Test 4: Delivery constraints satisfied");
  console.log("  ✓ Test 5: Final price does not exceed original price");
}

export function testPriceTamperingPrevention() {
  const product = SAMPLE_PRODUCTS[0];

  // Test 8: Simulate a tampered agreement where final price exceeds buyer budget
  const tamperedAgreement: NegotiationAgreement = {
    id: "agree_tampered_1",
    negotiationId: "sess_tampered_1",
    productId: product.id,
    productName: product.name,
    originalPrice: product.originalPrice,
    finalPrice: 999.0, // Tampered price higher than budget and listing
    savings: -699.01,
    deliveryDays: 3,
    buyerMaxPrice: 270.0,
    buyerMaxDeliveryDays: 3,
    merchantMinPrice: 220.0,
    currency: "USD",
    status: "AGREED",
    roundsCount: 3,
    createdAt: new Date().toISOString(),
    userApproved: true,
    termsSummary: "Tampered agreement",
    finalAgreedPrice: 999.0,
    savingsAmount: -699.01,
    totalSettlementAmount: 999.0,
  };

  saveNegotiationAgreement(tamperedAgreement);
  const result = validateAgreementForPayment("agree_tampered_1");

  if (result.valid) {
    throw new Error("Tampered agreement should have been rejected by backend validation");
  }
  console.log("  ✓ Test 6: Backend catches price exceeding original listing");

  // Test 7: Unaccepted / failed status cannot create payment
  const failedAgreement: NegotiationAgreement = {
    ...tamperedAgreement,
    id: "agree_failed_1",
    negotiationId: "sess_failed_1",
    finalPrice: 250.0,
    savings: 49.99,
    status: "FAILED",
  };
  saveNegotiationAgreement(failedAgreement);
  const failedResult = validateAgreementForPayment("agree_failed_1");

  if (failedResult.valid) {
    throw new Error("Failed/unaccepted agreement must NOT validate for payment");
  }
  console.log("  ✓ Test 7: Unaccepted negotiation cannot create payment");
  console.log("  ✓ Test 8: Frontend cannot override final price");
}
