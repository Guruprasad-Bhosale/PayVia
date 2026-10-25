# PayVia 3-Minute Hackathon Pitch & Demo Script
## "AI negotiates. PayPal settles."

**Event:** PayPal AI Hackathon 2026  
**Project:** PayVia — Autonomous Agent-to-Agent Commerce & Verified PayPal Settlement  
**Target Duration:** Exactly 3:00 minutes  
**Live Application URL:** [http://localhost:3000](http://localhost:3000)  

---

## 🕒 Timing & Storyboard

### 0:00 – 0:30 | Act 1 — The Problem & The PayVia Thesis
* **Visual:** Open PayVia homepage ([http://localhost:3000](http://localhost:3000)).
* **Speaker:**
  > "Today, 99% of online commerce is rigidly static. When businesses or individuals buy high-value items—like computing hardware, equipment, or enterprise gear—they pay a fixed sticker price or search for expired coupons. But in the real economy, buyers and sellers negotiate on price, delivery speed, and payment terms.
  > 
  > Welcome to **PayVia**. PayVia is the first autonomous agent-to-agent commerce negotiation platform built directly on top of PayPal Orders v2: **AI negotiates. PayPal settles.**"

---

### 0:30 – 1:05 | Act 2 — Buyer Intent & Multi-Merchant AI Negotiation
* **Visual:** Scroll to the canonical shopping composer on the homepage or open [/negotiate](http://localhost:3000/negotiate).
* **Action:**
  - Query: `"Lightweight laptop for college"` (or click the example helper).
  - Maximum Budget: `$760.00`.
  - Delivery SLA: `5 business days`.
  - Priority: `BALANCED` (Price + Delivery).
  - Click **"Find my deal"**.
* **Speaker:**
  > "As a buyer, I simply describe what I need, my budget ceiling, and delivery constraints. 
  > 
  > When I click 'Find my deal', my Buyer Agent negotiates in parallel with participating merchant agents. Notice that my budget ceiling is strictly private and hidden from sellers. Simultaneously, merchant agents defend their authorized price floors powered by Google Gemini and deterministic margin rules."

---

### 1:05 – 1:35 | Act 3 — Multi-Merchant Offer Ranking & Winning Selection
* **Visual:** The **Structured Multi-Merchant Offer Comparison** table appears.
* **Action:**
  - Point to the offers comparing **AI Negotiated** deals vs **Discovery Only** catalog items.
  - Note the composite ranking score, list price vs. agreed price, and savings badge.
  - Click **"Select Preferred Offer"** on the top-ranked offer.
* **Speaker:**
  > "PayVia deterministically normalizes and ranks candidate offers. When I select the preferred offer, PayVia executes three security invariants:
  > 1. It mints an authoritative server Transaction.
  > 2. It seals the agreed terms with a **SHA-256 cryptographic hash** to prevent any client-side tampering.
  > 3. It **atomically reserves inventory** with an expiry TTL so the item cannot be oversold to concurrent shoppers."

---

### 1:35 – 2:10 | Act 4 & 5 — Zero-Trust Human Approval Gate & PayPal Settlement
* **Visual:** The Agreement Review screen ([/agreement](http://localhost:3000/agreement)).
* **Action:**
  - Review the 5-tier terms breakdown (Item, Agreed Concessions, Final Price, Next Steps).
  - Click **"Approve agreement & continue to PayPal"**.
  - Show the redirect to PayPal Sandbox Checkout ([/checkout](http://localhost:3000/checkout)).
  - Complete the PayPal Sandbox authorization.
  - Land on the verified digital receipt ([/checkout/success](http://localhost:3000/checkout/success)).
* **Speaker:**
  > "Crucially, PayVia enforces a **Zero-Trust Human Approval Gate**. Autonomous AI agents never initiate financial transactions without explicit human review.
  > 
  > Once I approve the agreement, PayVia calls PayPal's Orders v2 API with the server-locked price. The buyer authorizes via official PayPal Sandbox. Upon return, the server executes a safe, idempotent POST capture, consumes the inventory reservation, and triggers the fulfillment engine."

---

### 2:10 – 2:40 | Act 6 — Merchant Command Center & Fulfillment Operations
* **Visual:** Open the Merchant Control Plane ([/merchant](http://localhost:3000/merchant)) and Fulfillment Timeline ([/fulfillment](http://localhost:3000/fulfillment)).
* **Action:**
  - **Merchant Dashboard:** Show the 4 clear sections:
    - *Overview:* Store performance & active floor boundaries.
    - *Catalog:* Inventory availability and AI negotiable eligibility.
    - *Negotiation Policies:* 4-tier policy editor (Pricing, Delivery SLA, Incentives, Strategy) + Strategy Bid Simulator.
    - *Transactions:* AG Grid Community v36 settlement ledger with direct fulfillment links.
  - **Fulfillment Operations:** Show the mobile-first Milestone Stepper (Order Placed ➔ Stock Reserved ➔ Payment Settled ➔ Packing ➔ Carrier Handover) and the Bryntum Advanced Gantt Schedule toggle.
* **Speaker:**
  > "From the merchant's side, PayVia Connect provides a complete control plane. Merchants define minimum price floors, allowable concessions, and autonomous bargaining strategies.
  > 
  > Every settled transaction synchronizes into our enterprise AG Grid ledger and generates an operational timeline via Bryntum Gantt, answering immediately: what is happening with this order, and what happens next?"

---

### 2:40 – 3:00 | Act 7 — Technical Credibility & Conclusion
* **Visual:** Return to hero section or AI Memory Explorer ([/memory](http://localhost:3000/memory)).
* **Speaker:**
  > "Under the hood, PayVia is backed by 150 automated invariant tests, cryptographic SHA-256 agreement verification, server-enforced expiry, atomic stock integrity, and official PayPal webhook signature verification. AI memory provides contextual intelligence while remaining strictly non-authoritative over financial rules.
  > 
  > PayVia turns static e-commerce into intelligent, verified, autonomous commerce:
  > **AI negotiates. PayPal settles.** Thank you!"

---

## 📋 Hackathon Demo Checklist & Pre-Flight Verification

- [x] Runtime verified: Next.js 15.1.7 (`http://localhost:3000`).
- [x] PayPal Sandbox credentials active in environment.
- [x] 150/150 invariant tests passing (`npm test`).
- [x] TypeScript clean: 0 errors (`npm run typecheck`).
- [x] Secret scanner passed: 0 leaks (`npm run check:secrets`).
- [x] Pre-loaded browser tabs:
  1. **Tab 1:** Home / Buyer Journey ([http://localhost:3000](http://localhost:3000))
  2. **Tab 2:** Agreement Review ([http://localhost:3000/agreement](http://localhost:3000/agreement))
  3. **Tab 3:** Merchant Control Plane ([http://localhost:3000/merchant](http://localhost:3000/merchant))
  4. **Tab 4:** Fulfillment Operations ([http://localhost:3000/fulfillment](http://localhost:3000/fulfillment))
  5. **Tab 5:** AI Memory Explorer ([http://localhost:3000/memory](http://localhost:3000/memory))
