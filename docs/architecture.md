# PayVia Architecture ⚡

> **The Reusable AI Negotiation & Settlement Infrastructure Layer for Digital Commerce**

---

## 1. Executive Summary

PayVia is not an ecommerce storefront. It is an **AI-driven negotiation and settlement protocol** designed to be embedded into any digital commerce platform, marketplace, procurement workflow, or AI shopping agent.

### Core Premise:
- **AI Negotiates**: Autonomous buyer and merchant agents dynamically negotiate economic terms (price, delivery window, payment timing).
- **PayVia Validates**: Server-side deterministic policies enforce non-negotiable pricing floors, buyer budget ceilings, and immutability seals.
- **PayPal Settles**: Once terms are approved, payment providers (PayPal Sandbox/Live) execute verified settlement matching the exact sealed agreement amount.

```text
External Commerce App / Marketplace
                 │
                 ▼
     POST /api/v1/transactions
                 │
                 ▼
       Transaction Intent
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
Buyer AI Agent        Merchant AI Agent
(Gemini 3.8 Flash)    (Gemini 3.8 Flash)
      │                     │
      └──────────┬──────────┘
                 │ Multi-turn Structured Proposals
                 ▼
     Negotiation Engine & Policy Validator
                 │
                 ▼
     Cryptographically Sealed Agreement
                 │ (SHA-256 Hash Locked)
                 ▼
      Explicit Human Approval
                 │
                 ▼
    Payment Provider (PayPal Orders v2)
                 │
                 ▼
   Verified Settlement & Receipt
                 │
                 ▼
   Fulfillment Engine (Bryntum Gantt)
```

---

## 2. Multi-Tenant Domain Hierarchy

```text
Platform (plat_xxx)
  ├── Merchants (merchant_xxx)
  │     ├── Policies (pol_xxx) [Private Floors]
  │     └── Catalog Items (prod_xxx)
  ├── Buyers (buyer_xxx)
  │     └── Policies (bpol_xxx) [Private Ceilings]
  └── Transactions (txn_xxx)
        ├── Negotiation Sessions (neg_xxx)
        │     └── Proposals (prop_xxx)
        ├── Agreements (agr_xxx) [SHA-256 Seal]
        ├── Settlements (set_xxx) [PayPal Orders]
        └── Audit Trail (audit_xxx) [Append-Only]
```

---

## 3. Core Entities & Roles

| Entity | ID Prefix | Description | Authority |
|---|---|---|---|
| **Platform** | `plat_` | External commerce tenant integrating PayVia | Tenant Isolation |
| **Merchant** | `merchant_` | Commercial seller holding private pricing floors | Merchant Policy |
| **Buyer** | `buyer_` | Purchasing party holding private budget limits | Buyer Budget |
| **Transaction** | `txn_` | Root commercial transaction holding initial intent | Transaction State |
| **NegotiationSession**| `neg_` | Multi-turn proposal state machine | Policy Boundaries |
| **Proposal** | `prop_` | Structured offer (`price`, `deliveryDays`, `paymentTiming`) | Candidate Term |
| **Agreement** | `agr_` | Cryptographically sealed immutable contract | Financial Authority |
| **Settlement** | `set_` | Payment transaction bound 1:1 to agreement | Payment Authority |
| **AuditEvent** | `audit_` | Immutable append-only log of all operations | Compliance & Audit |

---

## 4. Provider Boundaries & Pluggability

PayVia utilizes clean provider abstractions:
- **Settlement Providers** (`lib/providers/settlement`): `PayPalSettlementProvider`, `MockSettlementProvider`.
- **Catalog Providers** (`lib/providers/catalog`): `Channel3CatalogProvider`, `DemoCatalogProvider`.
- **Memory Providers** (`lib/providers/memory`): `ElasticMemoryProvider`, `InMemoryMemoryProvider`.
