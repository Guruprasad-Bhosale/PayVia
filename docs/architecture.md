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
│  - Bryntum Gantt Multi-Stage Supply Chain & Delivery Task Scheduling             │
│  - Elasticsearch Serverless Memory Indexing (Purchase Patterns, Context)         │
│  - AG Grid & AG Studio Merchant Analytics Live Synchronization                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Security & Integrity Invariants

### 1. Zero-Tamper Agreement Security
* The client cannot dictate prices or bypass negotiation constraints.
* Every agreement is sealed with a deterministic SHA-256 cryptographic hash computed across items, original price, negotiated final price, delivery days, and merchant identity:
  $$\text{Hash} = \text{SHA-256}(\text{id} + \text{items} + \text{finalPrice} + \text{merchantId} + \dots)$$
* Any client-side parameter tampering invalidates the hash and aborts settlement.

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

1. **PayPal Orders v2 & Webhook Verification:** Real REST Sandbox order creation, redirect approval, server-side capture, and cryptographic webhook verification.
2. **Google Gemini (Gemini 3.8 Flash):** Autonomous Buyer and Merchant conversational intelligence with bounded multi-turn consensus.
3. **Channel3:** Live e-commerce product discovery and normalized catalog feed integration.
4. **Elasticsearch Serverless:** AI vector and hybrid historical memory layer for customer preferences and pattern intelligence.
5. **AG Grid & AG Studio:** Merchant Command Center enterprise transactions grid, conversion tracking, and real-time revenue analytics.
6. **Bryntum Gantt:** Post-settlement dynamic fulfillment planning, SLA constraint resolution, and multi-stage dependency tracking.
