import {
  Transaction,
  TransactionIntent,
  TransactionStatus,
} from "@/lib/domain/types";
import { transactionRepo, platformRepo, merchantRepo, buyerRepo } from "@/lib/repositories";
import { TransactionIntentSchema } from "@/lib/domain/validation";
import { auditService } from "./audit.service";

export class TransactionService {
  /**
   * Initializes a new commercial transaction from a validated TransactionIntent.
   */
  async createTransaction(intentInput: unknown): Promise<Transaction> {
    const intent: TransactionIntent = TransactionIntentSchema.parse(intentInput);

    // Verify platform, merchant, and buyer existence or auto-provision if default demo
    let platform = await platformRepo.findById(intent.platformId);
    if (!platform) {
      platform = await platformRepo.create({
        id: intent.platformId,
        name: `Platform ${intent.platformId}`,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    let merchant = await merchantRepo.findById(intent.merchantId);
    if (!merchant) {
      merchant = await merchantRepo.create({
        id: intent.merchantId,
        platformId: intent.platformId,
        name: `Merchant ${intent.merchantId}`,
        email: "merchant@payvia.dev",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    let buyer = await buyerRepo.findById(intent.buyerId);
    if (!buyer) {
      buyer = await buyerRepo.create({
        id: intent.buyerId,
        platformId: intent.platformId,
        name: `Buyer ${intent.buyerId}`,
        email: "buyer@payvia.dev",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Calculate original total from items
    const originalTotal = intent.items.reduce(
      (sum, item) => sum + item.listPrice * item.quantity,
      0
    );

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const transaction: Transaction = {
      id: transactionId,
      platformId: intent.platformId,
      merchantId: intent.merchantId,
      buyerId: intent.buyerId,
      status: "INTENT_CREATED",
      currency: intent.currency || "USD",
      originalTotal: Number(originalTotal.toFixed(2)),
      intent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await transactionRepo.create(transaction);

    await auditService.log(
      saved.platformId,
      saved.id,
      "BUYER",
      saved.buyerId,
      "TRANSACTION_CREATED",
      {
        itemCount: intent.items.length,
        originalTotal: saved.originalTotal,
        maxBudget: intent.constraints.maxTotal,
      }
    );

    return saved;
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    return transactionRepo.findById(id);
  }

  async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
    metadataUpdates?: Partial<Transaction>
  ): Promise<Transaction> {
    return transactionRepo.update(id, {
      status,
      ...metadataUpdates,
      updatedAt: new Date().toISOString(),
    });
  }
}

export const transactionService = new TransactionService();
