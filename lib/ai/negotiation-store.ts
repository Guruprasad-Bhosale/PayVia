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

export function approveNegotiationAgreement(idOrNegotiationId: string): NegotiationAgreement | undefined {
  const agreement = getNegotiationAgreement(idOrNegotiationId);
  if (agreement) {
    agreement.userApproved = true;
    agreement.userApprovedAt = new Date().toISOString();
    saveNegotiationAgreement(agreement);
  }
  return agreement;
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
  code?: string;
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
      code: "AGREEMENT_NOT_FOUND",
    };
  }

  // 1. Status must be AGREED
  if (agreement.status !== "AGREED") {
    return {
      valid: false,
      error: `Negotiation status is '${agreement.status}', not AGREED. Payment cannot be initiated.`,
      code: "INVALID_STATUS",
    };
  }

  // 2. Expiry check (if expiresAt is specified)
  if ((agreement as any).expiresAt) {
    const expiresMs = new Date((agreement as any).expiresAt).getTime();
    if (isNaN(expiresMs) || Date.now() >= expiresMs) {
      return {
        valid: false,
        error: `Agreement has expired. Cannot initiate payment for expired agreement.`,
        code: "AGREEMENT_EXPIRED",
      };
    }
  }

  // 3. Final price must be positive
  if (typeof agreement.finalPrice !== "number" || agreement.finalPrice <= 0) {
    return {
      valid: false,
      error: `Invalid final price (${agreement.finalPrice}). Final price must be greater than 0.`,
      code: "INVALID_PRICE",
    };
  }

  // 4. Final price cannot exceed original catalog price
  if (agreement.finalPrice > agreement.originalPrice) {
    return {
      valid: false,
      error: `Tampering detected: Final price ($${agreement.finalPrice}) exceeds original listing price ($${agreement.originalPrice}).`,
      code: "PRICE_TAMPERED",
    };
  }

  // 5. Final price cannot exceed buyer's maximum budget constraint
  if (agreement.finalPrice > agreement.buyerMaxPrice) {
    return {
      valid: false,
      error: `Tampering detected: Final price ($${agreement.finalPrice}) exceeds buyer's maximum budget ceiling ($${agreement.buyerMaxPrice}).`,
      code: "BUDGET_EXCEEDED",
    };
  }

  // 6. Final price cannot be below merchant's minimum floor price
  if (agreement.finalPrice < agreement.merchantMinPrice) {
    return {
      valid: false,
      error: `Tampering detected: Final price ($${agreement.finalPrice}) is below merchant minimum acceptable floor ($${agreement.merchantMinPrice}).`,
      code: "FLOOR_VIOLATED",
    };
  }

  // 7. Delivery days must be positive and within buyer's requested window
  if (agreement.deliveryDays <= 0) {
    return {
      valid: false,
      error: `Invalid delivery days (${agreement.deliveryDays}). Must be positive.`,
      code: "INVALID_DELIVERY",
    };
  }

  if (agreement.deliveryDays > agreement.buyerMaxDeliveryDays) {
    return {
      valid: false,
      error: `Delivery timeframe (${agreement.deliveryDays} days) exceeds buyer's maximum requirement (${agreement.buyerMaxDeliveryDays} days).`,
      code: "DELIVERY_EXCEEDED",
    };
  }

  // 8. Savings must match exactly: originalPrice - finalPrice
  const expectedSavings = Number((agreement.originalPrice - agreement.finalPrice).toFixed(2));
  if (Math.abs(agreement.savings - expectedSavings) > 0.01) {
    return {
      valid: false,
      error: `Savings calculation discrepancy: expected $${expectedSavings}, found $${agreement.savings}.`,
      code: "SAVINGS_MISMATCH",
    };
  }

  return {
    valid: true,
    agreement,
  };
}
