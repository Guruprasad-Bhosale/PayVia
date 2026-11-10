# PayVia Architecture & Security Specification

**Platform:** PayVia — AI Agent-to-Agent Commerce & PayPal Settlement Platform  
**Environment:** PayPal AI Hackathon 2026  
**Core Thesis:** *"AI negotiates. PayPal settles."*

---

## 1. High-Level Architecture

PayVia provides a zero-trust, multi-agent protocol bridging buyer purchasing intent, merchant margin policy enforcement, cryptographic agreement generation, human authorization, and verified PayPal settlement.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            1. BUYER INTENT & DISCOVERY                           │
│  - ShoppingIntent (Query, Budget Ceiling, Delivery SLA, Optimization Priority)   │
│  - Multi-Merchant Discovery (Internal Managed Catalog + Channel3 Live Feed)      │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      2. PARALLEL MULTI-AGENT NEGOTIATION                         │
│  - Buyer Agent (Gemini 3.8 Flash / Deterministic Fallback, Private Ceiling)      │
│  - Merchant Agent (Deterministic Margin Policy Engine, Private Floor)            │
│  - Multi-Turn Economic Bargaining (Price, Concessions, Delivery, Payment SLA)    │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    3. DETERMINISTIC OFFER RANKING & SELECTION                    │
│  - Normalized Multi-Dimensional Ranking (PRICE, DELIVERY, BALANCED [0-100 pts])  │
│  - Buyer Selects Winning Candidate Offer (Unselected Offers Rejected)            │
│  - Atomic Inventory Reservation (15-min TTL, Non-Negative Stock Guarantee)       │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   4. AUTHORITATIVE AGREEMENT & HUMAN APPROVAL                    │
│  - Cryptographic SHA-256 Agreement Hash Sealing (Anti-Tamper Guarantee)          │
│  - Server-Enforced Agreement Expiration Boundary (currentTime < expiresAt)       │
│  - Explicit Human Buyer Approval Gate (POST /api/negotiate/approve)              │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   5. PAYPAL SANDBOX ORDERS V2 SETTLEMENT                         │
│  - Server-Side Order Creation Bound Strictly to Agreement.finalPrice             │
│  - Buyer Redirected to PayPal Sandbox Handoff URL                                │
│  - Server-Side Capture (GET/POST /api/paypal/capture-order)                      │
│  - Official Webhook Signature Verification (POST /v1/notifications/verify)       │
│  - Webhook Idempotency (Replayed Webhooks Cannot Duplicate Settlement)          │
│  - Stock Reservation Consumed Exactly Once (RESERVED -> CONSUMED)                │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│             6. FULFILLMENT ORCHESTRATION & VECTOR MEMORY SYNC                    │
│  - Bryntum Scheduler Multi-Stage Fulfillment & SLA Deadline Timeline             │
│  - Elasticsearch Serverless Memory Indexing (Purchase Patterns, Context)         │
│  - AG Grid Community Merchant Ledger & Operational Analytics                     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Security & Integrity Invariants

### 1. Zero-Tamper Agreement Security
* The client cannot dictate prices or bypass negotiation constraints.
* Every agreement is sealed with a deterministic `SHA-256` hash (`computeAgreementHash()` in `lib/domain/crypto.ts`) computed over canonical sorted-key JSON (`canonicalizeJson()`) across `id`, `transactionId`, `negotiationId`, `platformId`, `merchantId`, `buyerId`, `currency`, line items, `originalPrice`, `finalPrice`, `deliveryDays`, and `paymentTiming`, and verified with `crypto.timingSafeEqual()`.
* Any client-side parameter tampering invalidates the hash and aborts settlement.
* *(Scope note: SHA-256 validates integrity of sealed commercial terms; explicit buyer approval is enforced separately by `Agreement.status === "USER_APPROVED"`, expiration checks, and PayPal Orders v2 capture.)*

### 2. Server-Enforced Expiration (Fail-Closed)
* Before creating a PayPal order or capturing payment, the service strictly asserts:
  $$\text{Date.now()} < \text{expiresAt}$$
* Expired or malformed timestamps immediately reject with code `AGREEMENT_EXPIRED`.

### 3. Atomic Inventory Reservation & Zero-Oversell
* Stock reservations are established upon offer selection (`AVAILABLE → RESERVED`).
* Multiple concurrent buyers competing for the last unit yield exactly one reservation success and one `INSUFFICIENT_INVENTORY` graceful rejection.
* Available stock is strictly non-negative: $\text{Available} \ge 0$.
* Unconsumed reservations return to the available pool upon timeout or cancellation. Confirmed captures transition the reservation to `CONSUMED` and decrement physical stock permanently.

### 4. Official PayPal Webhook Signature Verification
* Inbound PayPal webhooks are cryptographically verified via PayPal's official endpoint:
  `POST /v1/notifications/verify-webhook-signature`
* All five transmission headers (`paypal-auth-algo`, `paypal-cert-url`, `paypal-transmission-id`, `paypal-transmission-sig`, `paypal-transmission-time`) must be verified as `SUCCESS` before any settlement state is updated.
* Replayed event IDs are handled idempotently (`DUPLICATE_EVENT_PROCESSED`).

### 5. Tenant Isolation & Private Floor Defense
* Merchant minimum price floors are strictly private business secrets.
* Buyer APIs sanitize all private margins before returning candidate offers.
* Multi-tenant authorization prevents Platform A from viewing or modifying Platform B resources (enforcing HTTP 403).

---

## 3. Technology Stack & Sponsor Integrations

1. **PayPal Developer Platform (Orders v2 & Webhooks):** Server-side Sandbox REST OAuth2 authentication, `POST /v2/checkout/orders` creation bound to `Agreement.finalPrice`, hosted Sandbox buyer approval, idempotent capture, and `/v1/notifications/verify-webhook-signature` verification (`lib/paypal/*`, `app/api/paypal/*`, `app/api/v1/webhooks/paypal/route.ts`).
2. **Google Gemini (`gemini-3.8-flash` via `@ai-sdk/google` & `ai`):** Structured multi-turn Buyer and Merchant negotiation reasoning, merchant analytics Q&A, and fulfillment schedule Q&A with deterministic bounded fallbacks (`lib/ai/*`, `lib/fulfillment/ai-agent.ts`, `app/api/merchant/ai/route.ts`).
3. **Channel3 Product Data API:** Live external e-commerce discovery (`POST https://api.trychannel3.com/v1/search`) normalized into `CandidateOffer` with curated offline catalog fallback (`lib/channel3/*`, `lib/providers/catalog/channel3.provider.ts`).
4. **PostgreSQL & Prisma ORM (`6.19.3`):** `15` relational models, SQL migrations, and idempotent seeding with in-memory local dev fallback (`prisma/schema.prisma`, `lib/repositories/prisma-repositories.ts`).
5. **Render:** Cloud Node web service blueprint and health check (`/api/health`) via `render.yaml` and `RENDER_EXTERNAL_URL` support in `lib/config/env.ts`.
6. **Elasticsearch Serverless (`@elastic/elasticsearch`):** Historical negotiation and fulfillment recall indexed asynchronously (`payvia-memory`) with prompt-injection fencing and local fallback (`lib/elastic/*`, `lib/memory/*`).
7. **AG Grid Community (`ag-grid-react` v36):** Interactive merchant transaction and settlement ledger (`components/merchant/MerchantGrid.tsx`). *(Note: `ag-studio` packages in `package.json` are unused at runtime; `MerchantStudioDashboard.tsx` renders native React analytics widgets.)*
8. **Bryntum Scheduler (`@bryntum/scheduler` trial package):** Post-settlement timeline scheduling, finish-to-start stage dependencies, and SLA deadline visualization (`components/fulfillment/BryntumScheduler.tsx`).
