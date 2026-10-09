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

    // Reject approving expired agreements
    if (agreement.expiresAt && Date.now() >= new Date(agreement.expiresAt).getTime()) {
      throw new Error(`AGREEMENT_EXPIRED: Cannot approve expired agreement ${agreementId} (expired at ${agreement.expiresAt}).`);
    }

    const updated = await agreementRepo.update(agreementId, {
      status: "USER_APPROVED",
      userApproved: true,
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
   * Authoritatively verifies agreement validity before settlement initiation or capture.
   * Enforces:
   * 1. Cryptographic SHA-256 integrity hash
   * 2. Server-side expiration timestamp (Date.now() >= expiresAt fails)
   * 3. Price boundary invariants (0 < finalPrice <= originalPrice)
   * 4. Explicit human user approval gate (unless already settled or explicitly overridden for capture)
   * 5. Terminal state guards (CANCELLED/DRAFT agreements cannot settle)
   */
  verifyAgreementForSettlement(
    agreement: Agreement,
    options?: {
      currentTimeMs?: number;
      requireApproval?: boolean;
    }
  ): { valid: boolean; error?: string; code?: string } {
    if (!agreement) {
      return { valid: false, error: "Agreement does not exist.", code: "AGREEMENT_NOT_FOUND" };
    }

    // 1. Cryptographic SHA-256 seal verification
    if (!verifyAgreementHash(agreement)) {
      return {
        valid: false,
        error: "Cryptographic hash mismatch. Agreement terms were modified or tampered.",
        code: "HASH_VERIFICATION_FAILED",
      };
    }

    // 2. Pricing integrity invariants
    if (agreement.finalPrice > agreement.originalPrice) {
      return {
        valid: false,
        error: "Final price exceeds original catalog listing price.",
        code: "PRICE_CEILING_VIOLATION",
      };
    }
    if (agreement.finalPrice <= 0 || isNaN(agreement.finalPrice)) {
      return {
        valid: false,
        error: "Invalid settlement amount.",
        code: "INVALID_AMOUNT",
      };
    }

    // 3. Expiry timestamp verification
    if (!agreement.expiresAt) {
      return {
        valid: false,
        error: "Missing agreement expiration timestamp.",
        code: "MISSING_EXPIRATION",
      };
    }

    const expiryTime = new Date(agreement.expiresAt).getTime();
    if (isNaN(expiryTime)) {
      return {
        valid: false,
        error: "Malformed agreement expiration timestamp.",
        code: "MALFORMED_EXPIRATION",
      };
    }

    const now = options?.currentTimeMs ?? Date.now();
    if (now >= expiryTime) {
      return {
        valid: false,
        error: `Agreement expired at ${agreement.expiresAt}. Settlement cannot be initiated.`,
        code: "AGREEMENT_EXPIRED",
      };
    }

    // 4. Terminal state checks
    if (agreement.status === "CANCELLED") {
      return {
        valid: false,
        error: "Agreement has been cancelled and cannot be settled.",
        code: "AGREEMENT_CANCELLED",
      };
    }

    if (agreement.status === "DRAFT") {
      return {
        valid: false,
        error: "Agreement is in draft state and has not been accepted.",
        code: "AGREEMENT_NOT_ACCEPTED",
      };
    }

    // 5. Explicit human approval check
    const requireApproval = options?.requireApproval ?? true;
    if (requireApproval && agreement.status !== "USER_APPROVED" && agreement.status !== "SETTLED") {
      return {
        valid: false,
        error: "Agreement requires explicit human user approval before payment settlement.",
        code: "USER_APPROVAL_REQUIRED",
      };
    }

    return { valid: true };
  }
}

export const agreementService = new AgreementService();

