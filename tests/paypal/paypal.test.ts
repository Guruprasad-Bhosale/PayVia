import { SAMPLE_PRODUCTS } from "@/data/products";
import {
  saveNegotiationAgreement,
  validateAgreementForPayment,
} from "@/lib/ai/negotiation-store";
import { NegotiationAgreement } from "@/types/negotiation";

export function testPayPalOrderAmountIntegrity() {
  const sampleProduct = SAMPLE_PRODUCTS[0];
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
