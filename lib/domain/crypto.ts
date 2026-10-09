import crypto from "node:crypto";
import { Agreement } from "./types";

/**
 * Deterministically stringifies an object with sorted keys
 * to ensure reproducible canonical cryptographic hashes.
 */
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map((item) => canonicalizeJson(item)).join(",")}]`;
  }

  const record = obj as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const pairs = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${canonicalizeJson(record[key])}`
  );

  return `{${pairs.join(",")}}`;
}

/**
 * Computes a SHA-256 cryptographic hash of the immutable financial terms of an agreement.
 * Any client or server tampering with price, items, delivery, or merchant/buyer bindings
 * invalidates this hash.
 */
export function computeAgreementHash(agreement: Omit<Agreement, "agreementHash">): string {
  const termsToHash = {
    id: agreement.id,
    transactionId: agreement.transactionId,
    negotiationId: agreement.negotiationId,
    platformId: agreement.platformId,
    merchantId: agreement.merchantId,
    buyerId: agreement.buyerId,
    currency: agreement.currency,
    items: agreement.items.map((item) => ({
      catalogItemId: item.catalogItemId,
      quantity: item.quantity,
      listPrice: Number(item.listPrice.toFixed(2)),
      agreedPrice: Number(item.agreedPrice.toFixed(2)),
    })),
    originalPrice: Number(agreement.originalPrice.toFixed(2)),
    finalPrice: Number(agreement.finalPrice.toFixed(2)),
    deliveryDays: agreement.deliveryDays,
    paymentTiming: agreement.paymentTiming,
  };

  const canonicalPayload = canonicalizeJson(termsToHash);
  return crypto.createHash("sha256").update(canonicalPayload).digest("hex");
}

/**
 * Verifies that an agreement's financial terms match its cryptographic hash.
 */
export function verifyAgreementHash(agreement: Agreement): boolean {
  if (!agreement.agreementHash) {
    return false;
  }
  const expectedHash = computeAgreementHash(agreement);
  return crypto.timingSafeEqual(
    Buffer.from(agreement.agreementHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );
}
