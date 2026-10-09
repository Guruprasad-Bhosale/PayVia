import {
  BuyerNegotiationPolicy,
  MerchantNegotiationPolicy,
  Proposal,
} from "@/lib/domain/types";
import { policyRepo } from "@/lib/repositories";
import {
  BuyerNegotiationPolicySchema,
  MerchantNegotiationPolicySchema,
} from "@/lib/domain/validation";

export interface PolicyValidationResult {
  valid: boolean;
  violations: string[];
}

export class PolicyService {
  /**
   * Sets or updates merchant negotiation policy
   */
  async setMerchantPolicy(
    merchantIdOrInput: string | unknown,
    policyData?: unknown
  ): Promise<MerchantNegotiationPolicy> {
    const rawInput =
      typeof merchantIdOrInput === "string"
        ? { ...(policyData as object), merchantId: merchantIdOrInput }
        : (merchantIdOrInput as any);

    const input = {
      platformId: rawInput.platformId || "plat_default",
      merchantId: rawInput.merchantId,
      catalogItemId: rawInput.catalogItemId,
      enabled: rawInput.enabled !== undefined ? rawInput.enabled : true,
      currency: rawInput.currency || "USD",
      listPrice: rawInput.listPrice ?? rawInput.pricing?.listPrice,
      minimumPrice: rawInput.minimumPrice ?? rawInput.pricing?.minimumPrice,
      minimumDeliveryDays: rawInput.minimumDeliveryDays ?? rawInput.delivery?.minimumDays ?? 1,
      maximumDeliveryDays: rawInput.maximumDeliveryDays ?? rawInput.delivery?.maximumDays ?? 14,
      immediateDiscountPercent: rawInput.immediateDiscountPercent ?? rawInput.paymentTerms?.immediateDiscountPercent,
      allowedPaymentTiming: rawInput.allowedPaymentTiming ?? rawInput.paymentTerms?.allowedTiming ?? ["IMMEDIATE"],
      strategy: rawInput.strategy || "BALANCED_ECONOMIC",
    };

    const validated = MerchantNegotiationPolicySchema.parse(input);
    const policy: MerchantNegotiationPolicy = {
      id: `pol_${validated.merchantId}_${validated.catalogItemId || "store"}`,
      platformId: validated.platformId,
      merchantId: validated.merchantId,
      catalogItemId: validated.catalogItemId,
      enabled: validated.enabled,
      currency: validated.currency,
      listPrice: validated.listPrice,
      minimumPrice: validated.minimumPrice,
      minimumDeliveryDays: validated.minimumDeliveryDays,
      maximumDeliveryDays: validated.maximumDeliveryDays,
      immediateDiscountPercent: validated.immediateDiscountPercent,
      allowedPaymentTiming: validated.allowedPaymentTiming,
      strategy: validated.strategy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return policyRepo.saveMerchantPolicy(policy);
  }

  /**
   * Retrieves merchant policy (server-side only)
   */
  async getMerchantPolicy(
    merchantId: string,
    catalogItemId?: string
  ): Promise<MerchantNegotiationPolicy | null> {
    return policyRepo.findMerchantPolicy(merchantId, catalogItemId);
  }

  /**
   * Sets or updates buyer negotiation policy
   */
  async setBuyerPolicy(policyInput: unknown): Promise<BuyerNegotiationPolicy> {
    const validated = BuyerNegotiationPolicySchema.parse(policyInput);
    const policy: BuyerNegotiationPolicy = {
      ...validated,
      id: `bpol_${validated.buyerId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return policyRepo.saveBuyerPolicy(policy);
  }

  /**
   * Retrieves buyer policy (server-side only)
   */
  async getBuyerPolicy(buyerId: string): Promise<BuyerNegotiationPolicy | null> {
    return policyRepo.findBuyerPolicy(buyerId);
  }

  /**
   * Evaluates whether a proposed offer complies with merchant floor and buyer budget constraints.
   * This deterministic check is ALWAYS authoritative over AI reasoning.
   */
  validateProposalAgainstPolicies(
    proposal: Proposal,
    merchantPolicy: MerchantNegotiationPolicy | null,
    buyerPolicy: BuyerNegotiationPolicy | null
  ): PolicyValidationResult {
    const violations: string[] = [];

    // 1. Merchant Policy Validation
    if (merchantPolicy) {
      if (!merchantPolicy.enabled) {
        violations.push("NEGOTIATION_DISABLED: Merchant has paused or disabled AI negotiation");
      } else {
        if (proposal.price < merchantPolicy.minimumPrice) {
          violations.push(
            `MERCHANT_FLOOR_VIOLATION: Proposed price $${proposal.price.toFixed(2)} breaches merchant minimum policy`
          );
        }
        if (proposal.price > merchantPolicy.listPrice) {
          violations.push(
            `LIST_PRICE_VIOLATION: Proposed price $${proposal.price.toFixed(2)} exceeds original list price $${merchantPolicy.listPrice.toFixed(2)}`
          );
        }
        if (proposal.deliveryDays < merchantPolicy.minimumDeliveryDays) {
          violations.push(
            `DELIVERY_CAPABILITY_VIOLATION: Delivery time ${proposal.deliveryDays}d is below merchant minimum capability (${merchantPolicy.minimumDeliveryDays}d)`
          );
        }
        if (
          merchantPolicy.allowedPaymentTiming &&
          !merchantPolicy.allowedPaymentTiming.includes(proposal.paymentTiming)
        ) {
          violations.push(
            `PAYMENT_TIMING_VIOLATION: Payment timing ${proposal.paymentTiming} is not supported by merchant`
          );
        }
      }
    }

    // 2. Buyer Policy Validation
    if (buyerPolicy) {
      if (proposal.price > buyerPolicy.maxBudget) {
        violations.push(
          `BUYER_BUDGET_VIOLATION: Proposed price $${proposal.price.toFixed(2)} exceeds buyer maximum budget`
        );
      }
      if (proposal.deliveryDays > buyerPolicy.maxDeliveryDays) {
        violations.push(
          `DELIVERY_DEADLINE_VIOLATION: Delivery time ${proposal.deliveryDays}d exceeds buyer maximum delivery deadline (${buyerPolicy.maxDeliveryDays}d)`
        );
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * Sanitizes merchant policy for external inspection (NEVER reveals raw minimum floor price).
   */
  sanitizeMerchantPolicy(policy: MerchantNegotiationPolicy): Omit<MerchantNegotiationPolicy, "minimumPrice"> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { minimumPrice, ...sanitized } = policy;
    return sanitized;
  }
}

export const policyService = new PolicyService();
