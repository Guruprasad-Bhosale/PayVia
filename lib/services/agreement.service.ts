import { Agreement, Proposal } from "@/lib/domain/types";
import { agreementRepo, negotiationRepo } from "@/lib/repositories";
import { computeAgreementHash, verifyAgreementHash } from "@/lib/domain/crypto";
import { transactionService } from "./transaction.service";
import { auditService } from "./audit.service";

export class AgreementService {
  /**
   * Creates an authoritative, cryptographically-sealed Agreement from an accepted proposal.
   */
  async createAgreementFromProposal(
    negotiationId: string,
    proposalId?: string
  ): Promise<Agreement> {
    const session = await negotiationRepo.findById(negotiationId);
    if (!session) {
      throw new Error(`Negotiation ${negotiationId} not found`);
    }

    const proposals = await negotiationRepo.getProposals(negotiationId);
    const targetProposal: Proposal | undefined = proposalId
      ? proposals.find((p) => p.id === proposalId)
      : session.activeProposal || proposals.find((p) => p.status === "ACCEPTED");

    if (!targetProposal) {
      throw new Error(`No accepted proposal found in negotiation ${negotiationId}`);
    }

    const transaction = await transactionService.getTransaction(session.transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${session.transactionId} not found`);
    }

    // Check if an agreement already exists for this negotiation
    const existing = await agreementRepo.findByNegotiationId(negotiationId);
    if (existing) {
      return existing;
    }

    const agreementId = `agr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const originalPrice = transaction.originalTotal;
    const finalPrice = targetProposal.price;
    const savings = Number(Math.max(0, originalPrice - finalPrice).toFixed(2));

    const agreementItems = transaction.intent.items.map((item) => ({
      catalogItemId: item.catalogItemId,
      title: item.title,
      quantity: item.quantity,
      listPrice: item.listPrice,
      agreedPrice: Number(((finalPrice * item.listPrice) / originalPrice).toFixed(2)),
      currency: item.currency,
    }));

    const draftAgreement: Omit<Agreement, "agreementHash"> = {
      id: agreementId,
      transactionId: transaction.id,
      negotiationId: session.id,
      platformId: transaction.platformId,
      merchantId: transaction.merchantId,
      buyerId: transaction.buyerId,
      currency: transaction.currency,
      items: agreementItems,
      originalPrice,
      finalPrice,
      savings,
      deliveryDays: targetProposal.deliveryDays,
      paymentTiming: targetProposal.paymentTiming,
      status: "ACCEPTED",
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    };

    // Seal the agreement with SHA-256 cryptographic hash
    const agreementHash = computeAgreementHash(draftAgreement);
    const sealedAgreement: Agreement = {
      ...draftAgreement,
      agreementHash,
    };

    const saved = await agreementRepo.create(sealedAgreement);

    await transactionService.updateTransactionStatus(transaction.id, "AGREED", {
      activeAgreementId: saved.id,
      finalTotal: saved.finalPrice,
      savingsTotal: saved.savings,
    });

    await auditService.log(
      saved.platformId,
      saved.transactionId,
      "SYSTEM",
      "agreement_authority",
      "AGREEMENT_CREATED",
      {
        agreementId: saved.id,
        finalPrice: saved.finalPrice,
        savings: saved.savings,
        agreementHash: saved.agreementHash,
      }
    );

    return saved;
  }

  async getAgreement(id: string): Promise<Agreement | null> {
    return agreementRepo.findById(id);
  }

  async getAgreementByTransaction(transactionId: string): Promise<Agreement | null> {
    return agreementRepo.findByTransactionId(transactionId);
  }

  /**
   * Records explicit human user approval before payment settlement.
   */
  async approveAgreement(agreementId: string): Promise<Agreement> {
    const agreement = await agreementRepo.findById(agreementId);
    if (!agreement) throw new Error(`Agreement ${agreementId} not found`);

    if (agreement.status === "SETTLED") {
      return agreement;
    }

    // Verify cryptographic integrity
    if (!verifyAgreementHash(agreement)) {
      throw new Error(`SECURITY BREACH: Agreement ${agreementId} failed cryptographic hash verification! Terms were tampered.`);
    }

    const updated = await agreementRepo.update(agreementId, {
      status: "USER_APPROVED",
      userApprovedAt: new Date().toISOString(),
    });

    await auditService.log(
      agreement.platformId,
      agreement.transactionId,
      "BUYER",
      agreement.buyerId,
      "AGREEMENT_LOCKED",
      {
        agreementId: agreement.id,
        approvedPrice: agreement.finalPrice,
      }
    );

    return updated;
  }

  /**
   * Verifies agreement validity for settlement.
   */
  verifyAgreementForSettlement(agreement: Agreement): { valid: boolean; error?: string } {
    if (!verifyAgreementHash(agreement)) {
      return { valid: false, error: "Cryptographic hash mismatch. Agreement terms modified." };
    }
    if (agreement.finalPrice > agreement.originalPrice) {
      return { valid: false, error: "Final price exceeds original catalog price." };
    }
    if (agreement.finalPrice <= 0) {
      return { valid: false, error: "Invalid settlement amount." };
    }
    return { valid: true };
  }
}

export const agreementService = new AgreementService();
