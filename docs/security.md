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

7. **Idempotency Defense**:
   - All mutation endpoints support `Idempotency-Key` headers to prevent double-charging or duplicate proposal submissions.
