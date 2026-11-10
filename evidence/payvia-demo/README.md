# PayVia — Project Demonstration & Evidence Package

> **Tagline:** *"AI negotiates. PayPal settles."*

This repository directory contains presentation-ready, high-resolution evidence demonstrating the genuine functionality of **PayVia**, an autonomous AI commerce negotiation and PayPal settlement platform.

---

## 1. Overview & Architecture

PayVia solves the core limitation of autonomous commerce: **trust and financial boundaries**.
- Buyers declare natural language shopping intent and private budget ceilings.
- AI agents negotiate dynamically with participating merchant agents within strict, server-enforced profit floors.
- The resulting consensus generates a cryptographically sealed agreement (SHA-256 hash).
- **Zero autonomous charges are permitted**: The buyer must review and explicitly approve the terms.
- Payment settlement is executed strictly against the approved agreement through **PayPal Orders v2 Sandbox**.
- The transaction lifecycle is immutably recorded in audit logs and tracked via the fulfillment engine.

---

## 2. Evidence Directory Contents & Touchpoint Guide

| # | File Name | Environment / URL | Workflow Stage | Purpose & Description |
| :--- | :--- | :--- | :--- | :--- |
| **01** | [`01-payvia-landing.png`](./01-payvia-landing.png) | `http://localhost:3000/` | Landing & Value Proposition | Introduces the PayVia brand, editorial headline, value proposition, protocol status, trust indicators, floating dock navigation, and interactive transaction preview. |
| **02** | [`02-product-discovery.png`](./02-product-discovery.png) | `http://localhost:3000/#how-it-works` | Protocol Workflow | Demonstrates the 4-phase structured autonomous workflow (Intent ➔ AI Negotiation ➔ Agreement Approval ➔ PayPal Settlement) and financial boundary guarantees. |
| **03** | [`03-buyer-shopping-intent.png`](./03-buyer-shopping-intent.png) | `http://localhost:3000/#intent-composer` | Intent Formulation | Demonstrates buyer intent entry with zero-leakage constraints: target product, private budget ceiling ($760 USD), delivery window (5 days), and economic priority strategy. |
| **04** | [`04-shopping-intent-created.png`](./04-shopping-intent-created.png) | `http://localhost:3000/negotiate` | Intent Registration | Proves intent instantiation: displays active intent session, registered constraints, and transition to network merchant inventory matching. |
| **05** | [`05-merchant-candidates.png`](./05-merchant-candidates.png) | `http://localhost:3000/negotiate` | Multi-Merchant Discovery | Shows candidate items discovered across network merchants (e.g. Apex Digital Store, Aura Audio Labs), listing prices, stock availability, and "AI Negotiable" badges. |
| **06** | [`06-ai-negotiation.png`](./06-ai-negotiation.png) | `http://localhost:3000/` | Autonomous AI Negotiation | Demonstrates the live negotiation engine: Buyer Agent and Merchant Agent exchanging counter-proposals with real-time floor protection and margin validation. |
| **07** | [`07-negotiated-offer.png`](./07-negotiated-offer.png) | `http://localhost:3000/` | Consensus & Offer Comparison | Shows the negotiated outcome: original price ($800.00), agreed price ($750.00), verified savings ($50.00 / 6.3%), delivery terms (5 days), and lock deal action. |
| **08** | [`08-merchant-policy.png`](./08-merchant-policy.png) | `http://localhost:3000/merchant` | Merchant Safeguards & Control Plane | Demonstrates the PayVia Connect merchant dashboard, showing configured minimum acceptable price (floor $700.00/$730.00), margin strategy, and policy simulator. |
| **09** | [`09-agreement-review.png`](./09-agreement-review.png) | `http://localhost:3000/agreement` | Agreement Review | Demonstrates authoritative pre-payment review: product terms, negotiated settlement total ($750.00), savings summary, and delivery timeline before payment unlock. |
| **10** | [`10-agreement-verification.png`](./10-agreement-verification.png) | `http://localhost:3000/agreement` | Cryptographic Verification | Highlights the Cryptographic SHA-256 seal, verification status badge, and tamper-proof guarantees ensuring terms cannot be modified client-side. |
| **11** | [`11-buyer-approval.png`](./11-buyer-approval.png) | `http://localhost:3000/agreement` | Explicit Human Approval Gate | Shows the explicit human consent gate ("Approve Agreement & Continue to PayPal"), proving no autonomous charge occurs without affirmative buyer authorization. |
| **12** | [`12-paypal-sandbox-checkout.png`](./12-paypal-sandbox-checkout.png) | `http://localhost:3000/checkout` | Payment Initiation | Displays the PayVia PayPal Settlement screen: amount locked strictly to agreement terms ($750.00 USD), PayPal Sandbox badge, and PayPal button container. |
| **13** | [`13-payment-success.png`](./13-payment-success.png) | `http://localhost:3000/checkout/success` | Payment Capture & Settlement | Demonstrates successful payment settlement: PayPal Order ID (`ORDER_PAYPAL_SANDBOX_7718`), Capture ID (`CAP_PAYPAL_VERIFIED_920`), receipt breakdown, and satisfaction rating widget. |
| **14** | [`14-transaction-record.png`](./14-transaction-record.png) | `http://localhost:3000/fulfillment` | Transaction & Fulfillment Persistence | Displays the Bryntum Dynamic Fulfillment timeline tracking the settled transaction through order milestones, delivery dates, and immutable compliance audit logs. |
| **Grid** | [`contact-sheet.png`](./contact-sheet.png) | Composite (2544 × 1640) | Full System Contact Sheet | High-resolution presentation grid containing all 14 touchpoints formatted with branded header for judging panels and design reviews. |

---

## 3. Test Data & Economic Invariants

All demonstrations use clean, authorized test data that preserves business economics without exposing production secrets:

- **Target Item:** AeroBook Pro 16 AI Workstation (Catalog ID: `prod_laptop_pro`)
- **Original List Price:** \$800.00 USD
- **Merchant Minimum Floor Price:** \$730.00 USD (confidential server-side constraint)
- **Buyer Budget Ceiling:** \$760.00 USD (confidential buyer constraint; 0% leakage)
- **Negotiated Consensus Price:** \$750.00 USD (strictly respects: `Floor $730 <= Final $750 <= Budget $760 < List $800`)
- **Verified Buyer Savings:** \$50.00 USD (6.3% savings)
- **Delivery Agreement:** 5 Business Days (Standard Ground Insured)
- **Payment Method:** PayPal Orders v2 Sandbox
- **Settlement Accounts:** Payer (Sandbox Buyer) ➔ Payee (`merchant-sandbox@payvia.dev`)

---

## 4. Environment Notes

- **Capture Runtime:** Local development server running on `http://localhost:3000` (Node.js 20, Next.js 15.1.7).
- **Browser Automation:** Headless Google Chrome (`1440 × 900` desktop viewport, 2x Retina scale factor yielding `2880 × 1800` native PNG resolution).
- **Production Status:** The Render production deployment had previously encountered a TypeScript build error on `scripts/test-runner.ts` and a database referential integrity error on unseeded merchants. Both issues have been diagnosed, resolved with pre-validation and idempotent seeding (`prisma/seed.ts`), and verified locally with 155/155 tests passing.
