# PayVia Commerce Network Semantics & Topology

## Overview

The **PayVia Commerce Network** connects buyers and disparate commerce systems under an intelligent, autonomous negotiation mesh.

---

## The Critical Network Distinction

The network differentiates two types of commerce nodes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DISCOVERED COMMERCE                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     PAYVIA-ENABLED MERCHANT   │             │   EXTERNAL / DISCOVERY-ONLY   │
├───────────────────────────────┤             ├───────────────────────────────┤
│ • Authoritative Platform Node │             │ • External Channel3 / Catalog │
│ • Private Merchant Policy     │             │ • No Private Floor on File    │
│ • Deterministic Policy Engine │             │ • Fixed-Price Listing Only    │
│ • Parallel AI Negotiation     │             │ • Cannot AI Negotiate         │
│ • Sealed SHA-256 Agreements   │             │ • External Checkout/Redirect  │
│ • PayPal Orders v2 Settlement │             │                               │
│                               │             │                               │
│ Badge: "AI Negotiable"        │             │ Badge: "Discoverable"         │
└───────────────────────────────┘             └───────────────────────────────┘
```

### 1. PayVia-Enabled Merchant
- Registered on an authenticated PayVia Platform.
- Active merchant policy defining minimum floor price, max concession per turn, delivery limits, and payment timing.
- Supports autonomous turn-by-turn counterproposals with policy-bounded safeguards.
- Display Badge: **`AI Negotiable`**.

### 2. External / Discovery-Only Merchant (e.g. Channel3)
- Discovered through web crawl or external affiliate feeds.
- PayVia **does not** possess or control the merchant's private negotiation policy.
- Invariant: **PayVia NEVER fakes negotiations on behalf of external merchants, invents private floors, or claims external agents agreed to an offer.**
- Display Badge: **`Discoverable`**.

---

## Parallel Multi-Merchant Negotiation Isolation

When a buyer creates a `ShoppingIntent`, PayVia discovers all eligible products matching the criteria and concurrently initiates negotiations across all PayVia-enabled merchants.

### Merchant Privacy Safeguards
1. **Zero Competitor Knowledge**: Merchant A receives only the candidate product negotiation request. It does not know that Merchant B or Merchant C are competing.
2. **Zero Price Peeking**: Merchant A cannot query what Merchant B offered.
3. **Buyer Budget Masking**: The buyer's `maxBudget` is never transmitted to the merchant agent. The merchant must price strictly against its own private policy floor and utility optimization curve.

---

## Network Metrics & Analytics

PayVia derives authoritative operational metrics from persisted records:
- **Shopping Intents**: Count of initiated shopping sessions.
- **Negotiations Started**: Active negotiation state machines.
- **Offers Generated**: Candidate offers created across merchants.
- **Offers Accepted**: Offers selected by buyers.
- **Transactions Created**: Authoritative transaction bindings.
- **Negotiated GMV**: Gross merchandise value settled through PayVia agreements.
- **PayPal Settlement Value**: Total value captured via PayPal Orders v2.
