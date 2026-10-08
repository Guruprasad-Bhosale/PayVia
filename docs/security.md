# Payvia Security Architecture & Guidelines

## 1. Zero-Trust Credential Management

### Secret Hierarchy
- **`secrets.txt`**: Local-only file strictly ignored by `.gitignore`. Contains actual development keys for PayPal Sandbox and AI provider.
- **`secrets.example.txt`**: Safe public template checked into version control with mock placeholder strings.
- **`.env.local` / `.env`**: Standard Next.js server-side environment variables, also excluded from Git.

### Server vs. Client Boundary Rules
- **Server Access Only**:
  - `PAYPAL_CLIENT_SECRET` (used exclusively in `lib/paypal/auth.ts` to request OAuth2 access tokens).
  - `AI_API_KEY` (used exclusively in server-side AI agent orchestration).
- **Client Access Allowed (Prefix `NEXT_PUBLIC_`)**:
  - `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (needed by PayPal JavaScript SDK on the frontend).
  - `NEXT_PUBLIC_APP_URL` (public origin).

---

## 2. Accidental Exposure Remediation Plan

If credentials are leaked or committed:
1. **Rotate Immediately**:
   - Navigate to PayPal Developer Dashboard > My Apps & Credentials > Sandbox. Regenerate the client secret.
   - Revoke the compromised AI API key in the provider portal.
2. **Scrub Git History**:
   - Use `git filter-repo` or BFG Repo-Cleaner if ever committed locally.
3. **Run Safety Audit**:
   - Execute `npm run check:secrets`.

---

## 3. Threat Model

| Threat Vector | Mitigation Strategy |
| :--- | :--- |
| **Client-side secret leakage** | Enforced Next.js module boundaries; server-only credential accessor (`lib/config/env.ts`); scanner script (`scripts/check-secrets.mjs`). |
| **Price Tampering / Replay Attacks** | Final agreement is signed with server-validated cryptographic integrity check before order creation. |
| **Prompt Injection / Agent Exploits** | Zod schemas constrain all negotiation inputs & outputs to numeric ranges and enumerated options; system prompts enforce inviolable budget boundaries. |
| **Unauthorized Capture** | PayPal Capture API is invoked strictly from server with server-held OAuth tokens after client approval. |
