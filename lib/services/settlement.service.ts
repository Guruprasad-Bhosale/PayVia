import { Settlement, SettlementProviderType } from "@/lib/domain/types";
import { settlementRepo, agreementRepo } from "@/lib/repositories";
import { agreementService } from "./agreement.service";
import { transactionService } from "./transaction.service";
import { auditService } from "./audit.service";
import { getSettlementProvider } from "@/lib/providers/settlement";

export class SettlementService {
  /**
   * Initiates payment settlement for an authoritative, cryptographically-sealed Agreement.
   * Enforces the critical invariant that the settlement amount is derived ONLY from the agreement.
   */
  async initiateSettlement(
    agreementId: string,
    options?: {
      provider?: SettlementProviderType;
      returnUrl?: string;
      cancelUrl?: string;
    }
  ): Promise<{
    settlement: Settlement;
    approvalUrl: string | null;
  }> {
    const agreement = await agreementService.getAgreement(agreementId);
    if (!agreement) {
      throw new Error(`Agreement ${agreementId} not found`);
    }

    // Verify cryptographic seal and invariants
    const verification = agreementService.verifyAgreementForSettlement(agreement);
    if (!verification.valid) {
      throw new Error(`Agreement validation failed: ${verification.error}`);
    }

    // Check if a pending settlement already exists
    const existingSettlement = await settlementRepo.findByAgreementId(agreementId);
    if (existingSettlement && existingSettlement.status === "CAPTURED") {
      return {
        settlement: existingSettlement,
        approvalUrl: null,
      };
    }

    const providerType = options?.provider || "PAYPAL_ORDERS_V2";
    const provider = getSettlementProvider(providerType);

    // Strict invariant: Provider receives the authoritative agreement final price
    const paymentResult = await provider.createPayment(agreement, {
      returnUrl: options?.returnUrl,
      cancelUrl: options?.cancelUrl,
    });

    const settlementId = existingSettlement?.id || `set_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const settlement: Settlement = {
      id: settlementId,
      agreementId: agreement.id,
      transactionId: agreement.transactionId,
      platformId: agreement.platformId,
      provider: providerType,
      status: "PENDING",
      amount: agreement.finalPrice, // Authority: Agreement
      currency: agreement.currency,
      externalOrderId: paymentResult.providerOrderId,
      createdAt: new Date().toISOString(),
    };

    const saved = existingSettlement
      ? await settlementRepo.update(existingSettlement.id, settlement)
      : await settlementRepo.create(settlement);

    await transactionService.updateTransactionStatus(agreement.transactionId, "SETTLED", {
      activeSettlementId: saved.id,
    });

    await auditService.log(
      agreement.platformId,
      agreement.transactionId,
      "SYSTEM",
      "settlement_coordinator",
      "SETTLEMENT_REQUESTED",
      {
        settlementId: saved.id,
        provider: providerType,
        externalOrderId: saved.externalOrderId,
        amount: saved.amount,
      }
    );

    return {
      settlement: saved,
      approvalUrl: paymentResult.approvalUrl,
    };
  }

  /**
   * Finalizes and captures payment, locking settlement and agreement state.
   */
  async captureSettlement(orderOrSettlementId: string): Promise<Settlement> {
    let settlement = await settlementRepo.findByExternalOrderId(orderOrSettlementId);
    if (!settlement) {
      settlement = await settlementRepo.findById(orderOrSettlementId);
    }
    if (!settlement) {
      throw new Error(`Settlement with order/settlement ID ${orderOrSettlementId} not found`);
    }

    if (settlement.status === "CAPTURED") {
      return settlement;
    }

    const providerOrderId = settlement.externalOrderId || orderOrSettlementId;
    const provider = getSettlementProvider(settlement.provider);
    const captureResult = await provider.capturePayment(providerOrderId);

    const updatedSettlement = await settlementRepo.update(settlement.id, {
      status: "CAPTURED",
      externalCaptureId: captureResult.providerCaptureId,
      payerEmail: captureResult.payerEmail,
      capturedAt: new Date().toISOString(),
      metadata: captureResult.metadata,
    });

    // Mark agreement settled
    await agreementRepo.update(settlement.agreementId, {
      status: "SETTLED",
      settledAt: new Date().toISOString(),
    });

    await auditService.log(
      settlement.platformId,
      settlement.transactionId,
      "SYSTEM",
      "paypal_settlement",
      "SETTLEMENT_CAPTURED",
      {
        settlementId: settlement.id,
        captureId: captureResult.providerCaptureId,
        amount: captureResult.amount,
      }
    );

    return updatedSettlement;
  }

  async getSettlement(id: string): Promise<Settlement | null> {
    return settlementRepo.findById(id);
  }
}

export const settlementService = new SettlementService();
