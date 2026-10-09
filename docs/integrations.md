# PayVia Integrations & External Platform Guide ⚡
*"AI negotiates. PayPal settles."*

---

## 🏛️ Integrating PayVia into an Ecommerce Platform

PayVia is an embeddable, multi-tenant AI commerce negotiation layer. Any external commerce platform, marketplace, shopping app, or AI agent can integrate PayVia to negotiate prices, delivery commitments, and payment terms before routing to PayPal for authoritative settlement.

```
External Commerce Platform (Web, Mobile, AI Agent)
                           ↓
               POST /api/v1/transactions
                           ↓
            PayVia Validates TransactionIntent
                           ↓
        Buyer Agent (Gemini) ↔ Merchant Agent (Gemini)
                           ↓
       Deterministic Policy Engine (Floors & Budgets)
                           ↓
        Cryptographically Sealed Agreement (SHA-256)
                           ↓
             Explicit Human Approval Gate
                           ↓
       Settlement Provider Abstraction (PayPal Orders v2)
                           ↓
                 Authoritative Capture
                           ↓
           Bryntum Fulfillment & Elastic Memory
```

---

## 🔑 Object Ownership Model

| Domain Object | Owner | Description |
| :--- | :--- | :--- |
| **Platform** (`plat_xxx`) | External Application | Multi-tenant root representing the integrating platform (e.g. Acme Commerce). |
| **Merchant** (`merchant_xxx`) | Platform / Store Owner | Merchant profile and settlement routing email. |
| **Merchant Policy** (`pol_xxx`) | Merchant / PayVia Server | **Private server-side floor prices**, delivery limits, and discounts. Never exposed to buyers. |
| **Buyer** (`buyer_xxx`) | Platform / Customer | End customer identity. |
| **Buyer Policy** (`bpol_xxx`) | Buyer / PayVia Server | **Private buyer maximum budget** and preferences. Never exposed to merchants. |
| **Catalog Item** (`prod_xxx`) | Merchant / Discovery | Product listings (via Channel3 or direct ingestion). |
| **Transaction Intent** | Buyer / Platform | Initial intent parameters (items, budget, constraints). |
| **Transaction** (`txn_xxx`) | PayVia Domain | Authoritative commercial record. |
| **Negotiation Session** (`neg_xxx`) | PayVia Engine | Multi-turn structured proposal state machine. |
| **Agreement** (`agr_xxx`) | PayVia Domain | Cryptographically sealed (SHA-256) economic terms. |
| **Settlement** (`set_xxx`) | PayPal Adapter | Authoritative payment record bound to `Agreement.finalPrice`. |
| **Audit Event** (`audit_xxx`) | PayVia Domain | Append-only immutable compliance log. |

---

## 💻 Quickstart: Programmatic Integration via SDK

```typescript
import { createPayViaClient } from "@payvia/sdk";

// 1. Initialize Client
const payvia = createPayViaClient({
  baseUrl: "https://payvia.onrender.com",
  apiKey: "pv_live_xxxxxxxxxxxxxxxxxxxxxxxx",
  platformId: "plat_acme_123",
});

// 2. Onboard Merchant Store & Set Private Policy
const merchant = await payvia.merchants.create({
  name: "Acme Pro Audio Gear",
  email: "sales@acme.example",
  settlementEmail: "merchant@acme.example",
});

await payvia.merchants.setPolicy(merchant.id, {
  enabled: true,
  currency: "USD",
  pricing: {
    listPrice: 1200,
    minimumPrice: 1050, // Private Floor: $1050 (0% leakage)
  },
  delivery: { minimumDays: 2, maximumDays: 6 },
  paymentTerms: { immediateDiscountPercent: 4, allowedTiming: ["IMMEDIATE"] },
});

// 3. Create Transaction from Buyer Intent
const transaction = await payvia.transactions.create({
  merchantId: merchant.id,
  buyerId: "buyer_user_456",
  currency: "USD",
  items: [{ catalogItemId: "prod_synth_01", title: "Synthesizer", quantity: 1, listPrice: 1200, currency: "USD" }],
  constraints: { maxTotal: 1120, maxDeliveryDays: 5 }, // Private Buyer Budget: $1120
});

// 4. Run Multi-Turn AI Negotiation
const { session, finalProposal, agreed } = await payvia.negotiations.runAutonomous(transaction.id);

// 5. Accept Agreement & Initiate PayPal Settlement
const { agreement } = await payvia.negotiations.accept(session.id, finalProposal.id);
const settlement = await payvia.settlements.create(agreement.id);

console.log(`Payment Link: ${settlement.approvalUrl}`);
console.log(`Bound Settlement Amount: $${settlement.agreementAmount} USD`);
```

---

## 🛡️ Sponsor Integrations Overview

### 1. PayPal Orders v2 Sandbox Integration
- **Role**: Authoritative payment settlement engine.
- **Provider Adapter**: `PayPalSettlementProvider` (`lib/providers/settlement/paypal-settlement-provider.ts`).
- **Endpoint Binding**: Orders are created server-side with `amount.value === agreement.finalPrice`.

### 2. Google Gemini 3.8 Flash Integration
- **Role**: Reasoning engine for Buyer Agent, Merchant Agent, Merchant AI Analyst, and Fulfillment AI.
- **Guardrail**: Non-authoritative. All proposed prices pass through `PolicyService.validateProposalAgainstPolicies()`.

### 3. Channel3 Product Discovery
- **Role**: Provider-agnostic real-world product search.
- **Provider Adapter**: `Channel3CatalogProvider` (`lib/providers/catalog/channel3-catalog-provider.ts`).
- **Fallback**: Gracefully falls back to demo catalog if Channel3 credentials are absent.

### 4. Elasticsearch Serverless Vector AI Memory
- **Role**: Persistent semantic memory and historical negotiation recall.
- **Provider Adapter**: `ElasticMemoryProvider` (`lib/providers/memory/elastic-memory-provider.ts`).
- **Resilience**: Operates asynchronously and non-blockingly; falls back to in-memory store if offline.

### 5. AG Grid & AG Studio Merchant Command Center
- **Role**: Real-time structured transaction intelligence, KPI grids, and margin visualization.

### 6. Bryntum Fulfillment Scheduler
- **Role**: Synchronized Gantt timeline, handover deadlines, and linehaul slack tracking.
