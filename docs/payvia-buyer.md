# PayVia Buyer Architecture & Orchestration

> **"An AI negotiation layer for commerce. AI negotiates. PayPal settles."**

## Overview

PayVia Buyer empowers consumers and external AI buyer agents to discover commerce, negotiate optimal terms across multiple merchants concurrently, compare structured candidate offers deterministically, and finalize transactions under an explicit human approval gate settled securely via PayPal.

---

## The Buyer Flow Pipeline

```
BUYER INTENT
    ↓
DISCOVERY
    ↓
MULTI-MERCHANT AI NEGOTIATION
    ↓
STRUCTURED OFFER COMPARISON
    ↓
BUYER SELECTION
    ↓
AUTHORITATIVE TRANSACTION & AGREEMENT
    ↓
EXPLICIT HUMAN APPROVAL GATE
    ↓
PAYPAL SETTLEMENT
```

---

## Key Core Concepts

### 1. Structured Economic Offer (Not a Chatbot)
PayVia is not primarily a free-form chatbot. The central unit of economic value is the **Candidate Offer**:
- Persisted and structured (`price`, `deliveryDays`, `paymentTiming`, `currency`, `savings`, `merchantId`).
- Backed by cryptographically verifiable state machines.
- Evaluated and ranked deterministically.

### 2. ShoppingIntent vs. TransactionIntent
- **`ShoppingIntent`**: Represents a buyer's discovery-stage intent prior to selecting a specific merchant or catalog product. Contains user query, multi-dimensional constraints (budget, delivery speed), and optimization preferences (`PRICE`, `DELIVERY`, `BALANCED`).
- **`TransactionIntent`**: Represents a specific commercial transaction commitment once a particular candidate offer and merchant are selected.

### 3. ShoppingSession Orchestration
A `ShoppingSession` governs a single buyer request across multiple candidate products and merchants:
```
ShoppingSession
       │
       ├── Candidate Product A (Merchant A) ➔ AI Negotiated Offer
       ├── Candidate Product B (Merchant B) ➔ AI Negotiated Offer
       └── Candidate Product C (Channel3)  ➔ Discoverable Only (Fixed Price)
                │
                ▼
        Deterministic Ranking & Comparison Grid
                │
                ▼
        Buyer Selects ONE Offer
                │
                ▼
        Authoritative Transaction & SHA-256 Agreement
                │
                ▼
        PayPal Capture
```

**Single-Order Invariant**: A `ShoppingSession` **never** creates multiple payable orders. Only the selected offer can become the transaction that is settled.

---

## Privacy Boundaries

| Data Dimension | Visible to Merchant Agent? | Visible to Buyer Agent? | Stored Authoritatively in PayVia |
| :--- | :--- | :--- | :--- |
| **Buyer Absolute Max Budget** | ❌ **NO (Protected)** | ✅ Yes | ✅ Yes (Session Constraints) |
| **Buyer Delivery Constraint** | ✅ Yes (Required for SLA) | ✅ Yes | ✅ Yes |
| **Merchant Minimum Floor Price**| ✅ Yes | ❌ **NO (Protected)** | ✅ Yes (Encrypted Merchant Policy) |
| **Competitor Identity / Offers**| ❌ **NO (Strict Isolation)**| ✅ Yes (Ranked Result) | ✅ Yes |
| **Internal PayVia Ranking Score**| ❌ **NO** | ❌ **NO** | ✅ Yes (Deterministic Ordering) |

---

## Explicit Human Approval & PayPal Settlement

No AI agent can automatically trigger financial transactions.
1. The buyer selects a preferred offer from the structured comparison table.
2. An authoritative `Transaction` and `Agreement` (sealed with SHA-256 cryptographic digest) are minted.
3. The UI presents the transparent breakdown:
   - Original Catalog Price
   - AI Negotiated Price
   - Realized Savings
   - Delivery Timeline
   - Final Total
4. The buyer clicks **"Approve & Pay with PayPal"**.
5. PayPal Orders v2 charges the exact `Agreement.finalPrice` with zero client-side price tampering.
