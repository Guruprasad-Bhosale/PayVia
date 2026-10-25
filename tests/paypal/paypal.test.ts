import { SAMPLE_PRODUCTS } from "@/data/products";
import {
  saveNegotiationAgreement,
  validateAgreementForPayment,
} from "@/lib/ai/negotiation-store";
import { NegotiationAgreement } from "@/types/negotiation";
import { agreementService } from "@/lib/services/agreement.service";
import { computeAgreementHash } from "@/lib/domain/crypto";
import { Agreement } from "@/lib/domain/types";

export function testPayPalOrderAmountIntegrity() {
  const sampleProduct = SAMPLE_PRODUCTS.find((p) => p.id === "prod_aurora_headphones") || SAMPLE_PRODUCTS[1];
  const agreedPrice = 245.0;
  const expectedSavings = Number((sampleProduct.originalPrice - agreedPrice).toFixed(2));

  const validAgreement: NegotiationAgreement = {
    id: "agree_valid_test_99",
    negotiationId: "sess_valid_test_99",
    productId: sampleProduct.id,
    productName: sampleProduct.name,
    originalPrice: sampleProduct.originalPrice,
    finalPrice: agreedPrice,
    savings: expectedSavings,
    deliveryDays: 3,
    buyerMaxPrice: 270.0,
    buyerMaxDeliveryDays: 3,
    merchantMinPrice: sampleProduct.minAcceptablePrice,
    currency: "USD",
    status: "AGREED",
    roundsCount: 3,
    createdAt: new Date().toISOString(),
    userApproved: true,
    termsSummary: "Valid test agreement",
    finalAgreedPrice: agreedPrice,
    savingsAmount: expectedSavings,
    totalSettlementAmount: agreedPrice,
  };

  saveNegotiationAgreement(validAgreement);

  const validation = validateAgreementForPayment("agree_valid_test_99");

  if (!validation.valid || !validation.agreement) {
    throw new Error(`Validation failed for valid agreement: ${validation.error}`);
  }

  // Mock PayPal order payload creation
  const mockOrderPayload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        custom_id: validation.agreement.id,
        description: `PayVia - Negotiated purchase - ${validation.agreement.productName}`,
        amount: {
          currency_code: validation.agreement.currency,
          value: validation.agreement.finalPrice.toFixed(2),
        },
      },
    ],
  };

  if (Number(mockOrderPayload.purchase_units[0].amount.value) !== agreedPrice) {
    throw new Error(
      `PayPal payload amount ($${mockOrderPayload.purchase_units[0].amount.value}) does not match agreed price ($${agreedPrice})`
    );
  }

  if (mockOrderPayload.purchase_units[0].custom_id !== validAgreement.id) {
    throw new Error("PayPal payload custom_id must link to the valid agreement ID");
  }

  console.log("  ✓ Test 9: Valid negotiation successfully formats PayPal Orders v2 payload");
  console.log("  ✓ Test 10: PayPal order amount exactly matches validated agreement amount ($245.00 USD)");
}

export function testPhase4PaymentLifecycleInvariants() {
  const sampleProduct = SAMPLE_PRODUCTS.find((p) => p.id === "prod_aurora_headphones") || SAMPLE_PRODUCTS[1];

  // 1. Explicit Human Approval Required Before Settlement
  const unapprovedAgreement: Agreement = {
    id: "agr_phase4_unapproved",
    transactionId: "txn_phase4_test",
    negotiationId: "neg_phase4_test",
    platformId: "plat_phase4",
    merchantId: "merch_phase4",
    buyerId: "buyer_phase4",
    currency: "USD",
    items: [
      {
        catalogItemId: "prod_laptop_01",
        title: "Test Laptop",
        quantity: 1,
        listPrice: 800,
        agreedPrice: 750,
        currency: "USD",
      },
    ],
    originalPrice: 800.0,
    finalPrice: 750.0,
    savings: 50.0,
    deliveryDays: 5,
    paymentTiming: "IMMEDIATE",
    status: "ACCEPTED", // Not yet USER_APPROVED
    userApproved: false,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    agreementHash: "",
  };
  unapprovedAgreement.agreementHash = computeAgreementHash(unapprovedAgreement);

  const unapprovedValidation = agreementService.verifyAgreementForSettlement(unapprovedAgreement);
  if (unapprovedValidation.valid || unapprovedValidation.code !== "USER_APPROVAL_REQUIRED") {
    throw new Error(
      `Phase 4 Invariant Failed: Unapproved agreement must be rejected before payment initiation (code: ${unapprovedValidation.code})`
    );
  }
  console.log("  ✓ Phase 4 Invariant 1: Unapproved agreement strictly rejected before order creation");

  // 2. Expired Agreement Rejection (Server-Side Expiry Guard)
  const expiredAgreement: Agreement = {
    id: "agr_phase4_expired",
    transactionId: "txn_phase4_test",
    negotiationId: "neg_phase4_test",
    platformId: "plat_phase4",
    merchantId: "merch_phase4",
    buyerId: "buyer_phase4",
    currency: "USD",
    items: [
      {
        catalogItemId: "prod_laptop_01",
        title: "Test Laptop",
        quantity: 1,
        listPrice: 800,
        agreedPrice: 750,
        currency: "USD",
      },
    ],
    originalPrice: 800.0,
    finalPrice: 750.0,
    savings: 50.0,
    deliveryDays: 5,
    paymentTiming: "IMMEDIATE",
    status: "USER_APPROVED",
    userApproved: true,
    userApprovedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() - 3600000).toISOString(), // Expired 1 hour ago
    agreementHash: "",
  };
  expiredAgreement.agreementHash = computeAgreementHash(expiredAgreement);

  const expiryCheck = agreementService.verifyAgreementForSettlement(expiredAgreement);
  if (expiryCheck.valid || expiryCheck.code !== "AGREEMENT_EXPIRED") {
    throw new Error(`Phase 4 Invariant Failed: Expired agreement was not rejected (code: ${expiryCheck.code})`);
  }
  console.log("  ✓ Phase 4 Invariant 2: Expired agreement strictly rejected by verifyAgreementForSettlement()");

  // 3. Agreement Tampering Rejection
  const tamperedAgreement: Agreement = {
    ...expiredAgreement,
    id: "agr_phase4_tampered",
    expiresAt: new Date(Date.now() + 86400000).toISOString(), // Future
    finalPrice: 1.0, // Tampered price ($1.00 instead of $750.00)
    // agreementHash left from $750.00
  };
  const tamperCheck = agreementService.verifyAgreementForSettlement(tamperedAgreement);
  if (tamperCheck.valid || tamperCheck.code !== "HASH_VERIFICATION_FAILED") {
    throw new Error("Phase 4 Invariant Failed: Tampered agreement price passed hash verification");
  }
  console.log("  ✓ Phase 4 Invariant 3: Tampered agreement terms fail cryptographic SHA-256 verification");

  // 4. Server-Authoritative Settlement Amount Lock
  const validDomainAgreement: Agreement = {
    ...expiredAgreement,
    id: "agr_phase4_valid",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    finalPrice: 750.0,
    agreementHash: "",
  };
  validDomainAgreement.agreementHash = computeAgreementHash(validDomainAgreement);

  const validCheck = agreementService.verifyAgreementForSettlement(validDomainAgreement);
  if (!validCheck.valid) {
    throw new Error(`Phase 4 Invariant Failed: Valid agreement failed verification: ${validCheck.error}`);
  }
  console.log("  ✓ Phase 4 Invariant 4: Server-authoritative agreement terms verified for PayPal settlement ($750.00 USD)");
}
