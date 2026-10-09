import {
  NegotiationSession,
  Proposal,
  ProposalStatus,
} from "@/lib/domain/types";
import { negotiationRepo } from "@/lib/repositories";
import { transactionService } from "./transaction.service";
import { policyService } from "./policy.service";
import { auditService } from "./audit.service";
import { ProposalCreateSchema } from "@/lib/domain/validation";
import { Product } from "@/types/product";

export interface SubmitProposalInput {
  senderType: "BUYER" | "MERCHANT";
  senderAgentId?: string;
  price: number;
  currency?: string;
  deliveryDays: number;
  paymentTiming?: "IMMEDIATE" | "NET_15" | "NET_30" | "ESCROW_DELIVERY";
  reasoningText?: string;
}

export class NegotiationService {
  /**
   * Starts a formal multi-turn negotiation session for a transaction.
   */
  async startNegotiation(transactionId: string): Promise<NegotiationSession> {
    const transaction = await transactionService.getTransaction(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // Check if negotiation already exists for this transaction
    const existing = await negotiationRepo.findByTransactionId(transactionId);
    if (existing) {
      return existing;
    }

    const negotiationId = `neg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const session: NegotiationSession = {
      id: negotiationId,
      transactionId,
      platformId: transaction.platformId,
      merchantId: transaction.merchantId,
      buyerId: transaction.buyerId,
      status: "OPEN",
      currency: transaction.currency,
      roundsCount: 0,
      proposals: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };

    const saved = await negotiationRepo.create(session);
    await transactionService.updateTransactionStatus(transactionId, "NEGOTIATING", {
      activeNegotiationId: saved.id,
    });

    await auditService.log(
      session.platformId,
      transactionId,
      "SYSTEM",
      "negotiation_engine",
      "NEGOTIATION_STARTED",
      { negotiationId: saved.id }
    );

    return saved;
  }

  async getNegotiation(id: string): Promise<NegotiationSession | null> {
    return negotiationRepo.findById(id);
  }

  /**
   * Submits and validates a structured proposal in a negotiation.
   * Deterministic server policies ALWAYS override AI recommendations.
   */
  async submitProposal(
    negotiationId: string,
    proposalInput: unknown
  ): Promise<{
    proposal: Proposal;
    acceptedByPolicy: boolean;
    policyViolations?: string[];
  }> {
    const validatedInput = ProposalCreateSchema.parse(proposalInput);
    const session = await negotiationRepo.findById(negotiationId);
    if (!session) {
      throw new Error(`Negotiation ${negotiationId} not found`);
    }

    if (session.status === "ACCEPTED" || session.status === "REJECTED" || session.status === "EXPIRED") {
      throw new Error(`Negotiation ${negotiationId} is already in a terminal state (${session.status})`);
    }

    const transaction = await transactionService.getTransaction(session.transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${session.transactionId} not found`);
    }

    // 1. Fetch private policies for validation
    const primaryItem = transaction.intent.items[0];
    const merchantPolicy = await policyService.getMerchantPolicy(
      session.merchantId,
      primaryItem?.catalogItemId
    );
    const buyerPolicy = await policyService.getBuyerPolicy(session.buyerId);

    const originalTotal = transaction.originalTotal;
    const savings = Math.max(0, originalTotal - validatedInput.price);

    const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const turnNumber = session.roundsCount + 1;

    const proposal: Proposal = {
      id: proposalId,
      negotiationId,
      turnNumber,
      senderType: (proposalInput as SubmitProposalInput).senderType || "BUYER",
      senderAgentId: validatedInput.senderAgentId,
      price: Number(validatedInput.price.toFixed(2)),
      currency: validatedInput.currency || session.currency,
      deliveryDays: validatedInput.deliveryDays,
      paymentTiming: validatedInput.paymentTiming,
      savings: Number(savings.toFixed(2)),
      status: "PENDING",
      reasoningText: validatedInput.reasoningText,
      createdAt: new Date().toISOString(),
    };

    // 2. Deterministic policy boundary check
    const validation = policyService.validateProposalAgainstPolicies(
      proposal,
      merchantPolicy,
      buyerPolicy
    );

    if (!validation.valid) {
      proposal.status = "REJECTED";
      await negotiationRepo.addProposal(proposal);

      await auditService.log(
        session.platformId,
        session.transactionId,
        proposal.senderType,
        proposal.senderAgentId || session.buyerId,
        "POLICY_VIOLATION_BLOCKED",
        {
          violations: validation.violations,
          proposedPrice: proposal.price,
        }
      );

      return {
        proposal,
        acceptedByPolicy: false,
        policyViolations: validation.violations,
      };
    }

    // Save valid proposal
    await negotiationRepo.addProposal(proposal);
    const newStatus = proposal.senderType === "BUYER" ? "BUYER_PROPOSED" : "MERCHANT_PROPOSED";

    await negotiationRepo.update(negotiationId, {
      status: newStatus,
      roundsCount: turnNumber,
      activeProposal: proposal,
    });

    await auditService.log(
      session.platformId,
      session.transactionId,
      proposal.senderType,
      proposal.senderAgentId || proposal.senderType,
      "PROPOSAL_SUBMITTED",
      {
        turnNumber,
        price: proposal.price,
        savings: proposal.savings,
        deliveryDays: proposal.deliveryDays,
      }
    );

    return {
      proposal,
      acceptedByPolicy: true,
    };
  }

  /**
   * Executes autonomous multi-turn consensus between Buyer Agent and Merchant Agent.
   */
  async runAutonomousNegotiation(
    transactionId: string
  ): Promise<{
    session: NegotiationSession;
    finalProposal?: Proposal;
    agreed: boolean;
  }> {
    const session = await this.startNegotiation(transactionId);
    const transaction = await transactionService.getTransaction(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    const item = transaction.intent.items[0];
    const constraints = transaction.intent.constraints;

    // Build adapter product representation for Gemini agent engines
    const productModel: Product = {
      id: item.catalogItemId,
      name: item.title,
      tagline: item.title,
      description: item.title,
      category: "General",
      originalPrice: item.listPrice,
      minAcceptablePrice: Number((item.listPrice * 0.88).toFixed(2)), // 12% default floor policy
      currency: item.currency,
      inventoryCount: 10,
      features: [],
      availableDeliveryOptions: [
        {
          id: "standard",
          name: "Standard Delivery",
          estimatedDays: constraints.maxDeliveryDays || 5,
          cost: 0,
          description: "Standard tracked delivery",
        },
      ],
      merchantPolicy: {
        maxDiscountPercentage: 15,
        allowFreeShippingNegotiation: true,
        bundleDiscountsAvailable: false,
      },
      merchantName: "Merchant Store",
      source: "demo",
    };

    const buyerConstraintsInput = {
      maxBudget: constraints.maxTotal,
      targetPrice: Number((constraints.maxTotal * 0.92).toFixed(2)),
      maxDeliveryDays: constraints.maxDeliveryDays,
    };

    const { runNegotiation } = await import("@/lib/ai/negotiation-engine");
    const aiResult = await runNegotiation(productModel, buyerConstraintsInput);

    let activeProposal: Proposal | undefined;
    if (aiResult.status === "AGREED" && aiResult.agreement) {
      const propRes = await this.submitProposal(session.id, {
        senderType: "BUYER",
        price: aiResult.agreement.finalPrice,
        deliveryDays: aiResult.agreement.deliveryDays,
        paymentTiming: "IMMEDIATE",
        reasoningText: aiResult.agreement.termsSummary,
      });

      if (propRes.acceptedByPolicy) {
        activeProposal = propRes.proposal;
        await this.acceptProposal(session.id, propRes.proposal.id);
      }
    }

    const updatedSession = (await negotiationRepo.findById(session.id))!;
    return {
      session: updatedSession,
      finalProposal: activeProposal,
      agreed: updatedSession.status === "ACCEPTED",
    };
  }

  /**
   * Accepts a proposal, formally closing the negotiation.
   */
  async acceptProposal(negotiationId: string, proposalId: string): Promise<Proposal> {
    const session = await negotiationRepo.findById(negotiationId);
    if (!session) throw new Error(`Negotiation ${negotiationId} not found`);

    const proposals = await negotiationRepo.getProposals(negotiationId);
    const target = proposals.find((p) => p.id === proposalId);
    if (!target) throw new Error(`Proposal ${proposalId} not found`);

    target.status = "ACCEPTED" as ProposalStatus;
    await negotiationRepo.update(negotiationId, {
      status: "ACCEPTED",
      activeProposal: target,
    });

    await auditService.log(
      session.platformId,
      session.transactionId,
      "SYSTEM",
      "consensus_gate",
      "PROPOSAL_ACCEPTED",
      {
        proposalId,
        agreedPrice: target.price,
        savings: target.savings,
        deliveryDays: target.deliveryDays,
      }
    );

    return target;
  }
}

export const negotiationService = new NegotiationService();
