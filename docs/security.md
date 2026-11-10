# PayVia Security & Invariant Guarantees ⚡

---

## 1. Absolute Security Invariants

1. **AI Output Is Non-Authoritative**:
   - AI generates reasoning and proposed terms.
   - Deterministic policy validation gates every proposal before it is admitted into state.
   - AI can NEVER authorize payments or override pricing constraints.

2. **Merchant Floor Privacy**:
   - A merchant's minimum acceptable price floor (`minimumPrice`) is private.
   - The buyer agent and buyer UI never receive the raw floor value.
   - Any counteroffer or rejection reveals only whether the terms are acceptable.

3. **Buyer Budget Privacy**:
   - A buyer's maximum budget ceiling (`maxBudget`) is private.
   - The merchant agent and merchant UI never receive the raw maximum ceiling.

4. **Cryptographic Agreement Immutability**:
   - Finalized agreements are sealed with a SHA-256 hash across all financial terms (`agreementHash`).
   - If any client or third-party tampers with the price, currency, items, or terms, the hash check fails immediately.

5. **PayPal Amount Binding**:
   - The payment amount sent to PayPal Orders v2 is derived 100% from the server-validated, cryptographically-sealed `Agreement.finalPrice`.
   - Client-submitted prices are ignored.

6. **Zero Client-Side Credentials**:
   - PayPal Client Secret, Gemini API Key, Channel3 Key, and Elasticsearch API Key are server-only.
   - Zero credentials are exposed in browser JavaScript bundles or API responses.

7. **Explicit Human Buyer Approval Gate**:
   - PayPal order initiation is blocked (`USER_APPROVAL_REQUIRED`) until the buyer explicitly reviews and approves the commercial terms (`POST /api/negotiate/approve` -> `status = "USER_APPROVED"`).

8. **Server-Enforced Expiration & Atomic Stock Locks**:
   - Agreements expire (`Date.now() >= expiresAt` -> `AGREEMENT_EXPIRED`) so stale quotes cannot be captured.
   - Selecting an offer reserves inventory atomically (`AVAILABLE -> RESERVED`, 15-minute TTL) and permanently consumes stock (`CONSUMED`) only once per settled order.

9. **Idempotency Defense**:
   - All mutation endpoints and PayPal webhook handlers enforce `Idempotency-Key` / `IdempotencyRecord` checks to prevent duplicate proposal submissions, duplicate captures, or webhook replay side effects.
