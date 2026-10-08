import { NegotiationAgreement, NegotiationSession } from "@/types/negotiation";

/**
 * Server-side persistent in-memory store for PayVia negotiation sessions and agreements.
 * Prevents client-side price tampering by ensuring all PayPal orders are generated
 * strictly from server-validated agreements.
 */

// Use globalThis to persist across Next.js dev server hot-reloads
const globalStore = globalThis as unknown as {
  __payviaSessions?: Map<string, NegotiationSession>;
  __payviaAgreements?: Map<string, NegotiationAgreement>;
};

if (!globalStore.__payviaSessions) {
  globalStore.__payviaSessions = new Map<string, NegotiationSession>();
}
if (!globalStore.__payviaAgreements) {
  globalStore.__payviaAgreements = new Map<string, NegotiationAgreement>();
}

const sessions = globalStore.__payviaSessions;
const agreements = globalStore.__payviaAgreements;

export function saveNegotiationSession(session: NegotiationSession): void {
  sessions.set(session.id, session);
  if (session.agreement) {
    saveNegotiationAgreement(session.agreement);
  }
}

export function getNegotiationSession(sessionId: string): NegotiationSession | undefined {
  return sessions.get(sessionId);
}

export function saveNegotiationAgreement(agreement: NegotiationAgreement): void {
  agreements.set(agreement.id, agreement);
  agreements.set(agreement.negotiationId, agreement);
}

export function getNegotiationAgreement(idOrNegotiationId: string): NegotiationAgreement | undefined {
  return agreements.get(idOrNegotiationId);
}

export function getAllNegotiationSessions(): NegotiationSession[] {
  return Array.from(sessions.values());
}

export function getAllAgreements(): NegotiationAgreement[] {
  // Return unique agreements by id
  const unique = new Map<string, NegotiationAgreement>();
  for (const ag of agreements.values()) {
    unique.set(ag.id, ag);
  }
  return Array.from(unique.values());
}

export interface AgreementValidationResult {
  valid: boolean;
  agreement?: NegotiationAgreement;
  error?: string;
}

/**
 * Validates a negotiated agreement against hard financial & operational invariants.
 * Strictly guarantees that no untrusted frontend value can dictate the PayPal transaction amount.
 */
export function validateAgreementForPayment(
  negotiationId: string
): AgreementValidationResult {
  const agreement = getNegotiationAgreement(negotiationId);

  if (!agreement) {
    return {
      valid: false,
      error: `Negotiation agreement '${negotiationId}' not found. Please complete the negotiation first.`,
    };
  }

  // 1. Status must be AGREED
  if (agreement.status !== "AGREED") {
    return {
      valid: false,
      error: `Negotiation status is '${agreement.status}', not AGREED. Payment cannot be initiated.`,
    };
  }

  // 2. Final price must be positive
  if (typeof agreement.finalPrice !== "number" || agreement.finalPrice <= 0) {
    return {
      valid: false,
      error: `Invalid final price (${agreement.finalPrice}). Final price must be greater than 0.`,
    };
  }

  // 3. Final price cannot exceed original catalog price
  if (agreement.finalPrice > agreement.originalPrice) {
    return {
      valid: false,
      error: `Tampering detected: Final price ($${agreement.finalPrice}) exceeds original listing price ($${agreement.originalPrice}).`,
    };
  }

  // 4. Final price cannot exceed buyer's maximum budget constraint
  if (agreement.finalPrice > agreement.buyerMaxPrice) {
    return {
      valid: false,
      error: `Tampering detected: Final price ($${agreement.finalPrice}) exceeds buyer's maximum budget ceiling ($${agreement.buyerMaxPrice}).`,
    };
  }

  // 5. Final price cannot be below merchant's minimum floor price
  if (agreement.finalPrice < agreement.merchantMinPrice) {
    return {
      valid: false,
      error: `Tampering detected: Final price ($${agreement.finalPrice}) is below merchant minimum acceptable floor ($${agreement.merchantMinPrice}).`,
    };
  }

  // 6. Delivery days must be positive and within buyer's requested window
  if (agreement.deliveryDays <= 0) {
    return {
      valid: false,
      error: `Invalid delivery days (${agreement.deliveryDays}). Must be positive.`,
    };
  }

  if (agreement.deliveryDays > agreement.buyerMaxDeliveryDays) {
    return {
      valid: false,
      error: `Delivery timeframe (${agreement.deliveryDays} days) exceeds buyer's maximum requirement (${agreement.buyerMaxDeliveryDays} days).`,
    };
  }

  // 7. Savings must match exactly: originalPrice - finalPrice
  const expectedSavings = Number((agreement.originalPrice - agreement.finalPrice).toFixed(2));
  if (Math.abs(agreement.savings - expectedSavings) > 0.01) {
    return {
      valid: false,
      error: `Savings calculation discrepancy: expected $${expectedSavings}, found $${agreement.savings}.`,
    };
  }

  return {
    valid: true,
    agreement,
  };
}
