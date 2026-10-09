import { NextRequest, NextResponse } from "next/server";
import { policyService } from "@/lib/services/policy.service";
import { Proposal, MerchantNegotiationPolicy } from "@/lib/domain/types";
import { authenticatePlatform, PlatformAuthError } from "@/lib/auth/platform-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authContext = await authenticatePlatform(req);
    const body = await req.json();

    const merchantId = body.merchantId || "merchant_default";

    // Use passed policy or load from persistence
    let policy: MerchantNegotiationPolicy | null = null;
    if (body.policy) {
      policy = {
        id: `pol_${merchantId}_temp`,
        platformId: authContext.platformId,
        merchantId,
        enabled: body.policy.enabled !== undefined ? body.policy.enabled : true,
        currency: body.policy.currency || "USD",
        listPrice: Number(body.policy.listPrice || 800),
        minimumPrice: Number(body.policy.minimumPrice || 750),
        minimumDeliveryDays: Number(body.policy.minimumDeliveryDays || 2),
        maximumDeliveryDays: Number(body.policy.maximumDeliveryDays || 5),
        immediateDiscountPercent: Number(body.policy.immediateDiscountPercent || 3),
        allowedPaymentTiming: body.policy.allowedPaymentTiming || ["IMMEDIATE", "NET_30"],
        strategy: body.policy.strategy || "BALANCED_ECONOMIC",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      policy = await policyService.getMerchantPolicy(merchantId);
    }

    if (!policy) {
      return NextResponse.json(
        {
          error: {
            code: "POLICY_NOT_CONFIGURED",
            message: "No active merchant policy found to simulate.",
          },
        },
        { status: 400 }
      );
    }

    if (!policy.enabled) {
      return NextResponse.json({
        success: true,
        negotiationEnabled: false,
        decision: "PAUSED",
        merchantAgentMessage:
          "AI Negotiation is currently PAUSED. Orders will be processed at standard list price.",
        suggestedCounter: null,
        policyBounds: {
          listPrice: policy.listPrice,
          deliveryWindow: `${policy.minimumDeliveryDays}–${policy.maximumDeliveryDays} days`,
        },
        requestId: authContext.requestId,
      });
    }

    const buyerOfferPrice = Number(body.buyerOffer?.price || 740);
    const buyerDeliveryDays = Number(body.buyerOffer?.deliveryDays || 3);
    const buyerPaymentTiming = body.buyerOffer?.paymentTiming || "IMMEDIATE";

    const simulatedProposal: Proposal = {
      id: `prop_sim_${Date.now()}`,
      negotiationId: "neg_sim",
      turnNumber: 1,
      senderType: "BUYER",
      price: buyerOfferPrice,
      currency: policy.currency,
      deliveryDays: buyerDeliveryDays,
      paymentTiming: buyerPaymentTiming,
      savings: Math.max(0, policy.listPrice - buyerOfferPrice),
      status: "PENDING",
      reasoningText: body.buyerOffer?.reasoning || "Simulated buyer query",
      createdAt: new Date().toISOString(),
    };

    const validationResult = policyService.validateProposalAgainstPolicies(
      simulatedProposal,
      policy,
      null
    );

    let decision: "ACCEPT" | "COUNTER" | "REJECT";
    let merchantAgentMessage: string;
    let suggestedCounter: {
      price: number;
      deliveryDays: number;
      paymentTiming: string;
      discountPercent: number;
    } | null = null;

    if (validationResult.valid) {
      decision = "ACCEPT";
      merchantAgentMessage = `Offer accepted! The proposed terms ($${buyerOfferPrice.toFixed(
        2
      )} with ${buyerDeliveryDays}-day delivery) fall well within our authorized merchant parameters.`;
    } else if (buyerOfferPrice < policy.minimumPrice) {
      decision = "COUNTER";
      const counterPrice = Number(
        (
          policy.minimumPrice *
          (buyerPaymentTiming === "IMMEDIATE" && policy.immediateDiscountPercent
            ? 1 - policy.immediateDiscountPercent / 100
            : 1)
        ).toFixed(2)
      );
      const effectiveCounter = Math.max(policy.minimumPrice, counterPrice);
      const counterDelivery = Math.max(policy.minimumDeliveryDays, buyerDeliveryDays);

      merchantAgentMessage = `A price of $${buyerOfferPrice.toFixed(
        2
      )} is outside our approved economic rules. However, I can offer $${effectiveCounter.toFixed(
        2
      )} with ${counterDelivery}-day delivery for ${buyerPaymentTiming.toLowerCase()} settlement.`;

      suggestedCounter = {
        price: effectiveCounter,
        deliveryDays: counterDelivery,
        paymentTiming: buyerPaymentTiming,
        discountPercent: Number(
          (((policy.listPrice - effectiveCounter) / policy.listPrice) * 100).toFixed(1)
        ),
      };
    } else if (buyerDeliveryDays < policy.minimumDeliveryDays) {
      decision = "COUNTER";
      merchantAgentMessage = `We cannot fulfill in ${buyerDeliveryDays} days (minimum capability is ${policy.minimumDeliveryDays} days). I can offer $${buyerOfferPrice.toFixed(
        2
      )} with expedited ${policy.minimumDeliveryDays}-day delivery.`;

      suggestedCounter = {
        price: buyerOfferPrice,
        deliveryDays: policy.minimumDeliveryDays,
        paymentTiming: buyerPaymentTiming,
        discountPercent: Number(
          (((policy.listPrice - buyerOfferPrice) / policy.listPrice) * 100).toFixed(1)
        ),
      };
    } else {
      decision = "REJECT";
      merchantAgentMessage =
        "The requested terms conflict with current merchant policy. Terms cannot be agreed.";
    }

    return NextResponse.json({
      success: true,
      negotiationEnabled: true,
      decision,
      merchantAgentMessage,
      simulatedBuyerOffer: {
        price: buyerOfferPrice,
        deliveryDays: buyerDeliveryDays,
        paymentTiming: buyerPaymentTiming,
      },
      suggestedCounter,
      policyViolations: validationResult.violations,
      policyBounds: {
        listPrice: policy.listPrice,
        deliveryWindow: `${policy.minimumDeliveryDays}–${policy.maximumDeliveryDays} days`,
        immediateDiscount: policy.immediateDiscountPercent ? `${policy.immediateDiscountPercent}%` : "None",
      },
      requestId: authContext.requestId,
    });
  } catch (error) {
    if (error instanceof PlatformAuthError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }
    return NextResponse.json(
      {
        error: {
          code: "SIMULATION_FAILED",
          message: error instanceof Error ? error.message : "Failed to simulate merchant agent",
        },
      },
      { status: 400 }
    );
  }
}
