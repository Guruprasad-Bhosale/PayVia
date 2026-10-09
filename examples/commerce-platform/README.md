# Acme Commerce — External Platform Integration Example

This example demonstrates how an independent third-party commerce platform (**Acme Commerce**) integrates PayVia as an autonomous AI negotiation and settlement layer.

---

## 🎯 Architecture

```
Acme Commerce Platform (Web App / Marketplace / AI Agent)
                           ↓
          PayVia SDK Client (`@payvia/sdk`)
                           ↓
               PayVia REST API (v1)
                           ↓
        Multi-Tenant Domain & Policy Engine
                           ↓
      Cryptographically Sealed Agreement (SHA-256)
                           ↓
      Settlement Provider (PayPal Orders v2 Sandbox)
```

---

## 🚀 End-to-End Workflow

1. **Platform Authentication**: Acme Commerce authenticates using its API key (`pv_test_...`).
2. **Merchant Onboarding**: Acme registers a merchant store with custom negotiation policies (list price, floor price, delivery constraints).
3. **Catalog Item Ingestion**: Registers a product in the catalog.
4. **Transaction Intent Creation**: When a customer wants to buy, Acme creates a `TransactionIntent` with buyer budget and constraints.
5. **Multi-Turn AI Negotiation**: Buyer and merchant agents autonomously negotiate price and delivery terms.
6. **Deterministic Policy Validation**: Server-side policy engine ensures proposals respect the merchant floor and buyer budget without leaking private limits.
7. **Cryptographic Agreement Sealing**: Accepted proposal is locked and hashed with SHA-256.
8. **PayPal Settlement Binding**: PayPal order is created strictly for `Agreement.finalPrice`.
9. **Authoritative Capture**: Payment is captured and confirmed.
10. **Immutable Audit Trail**: Full reconstruction of every proposal, counter, decision, and payment event.

---

## 🏃 Running the Example

To run the full end-to-end integration test runner:

```bash
npx tsx examples/commerce-platform/acme-commerce-runner.ts
```
