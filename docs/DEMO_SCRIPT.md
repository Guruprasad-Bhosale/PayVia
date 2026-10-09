# PayVia 3-Minute Hackathon Pitch & Demo Script

**Event:** PayPal AI Hackathon 2026  
**Project:** PayVia — AI Agent-to-Agent Commerce & PayPal Settlement Platform  
**Target Duration:** Exactly 3:00 minutes  
**Tagline:** *“AI negotiates. PayPal settles.”*

---

## 🕒 Timing & Storyboard

### 0:00 – 0:25 | The Problem: Static Pricing in an Agentic World
* **Visual:** Open the PayVia homepage ([http://localhost:3000](http://localhost:3000)).
* **Narrator:**
  > "Today, 99% of online commerce is rigidly static. When you buy a high-value item—like computing hardware, bulk office supplies, or specialized gear—you pay a fixed price or wait for generic coupons. But in real-world commerce, businesses negotiate: on price, delivery speed, and payment terms.
  > 
  > Welcome to **PayVia**. PayVia is the first autonomous agent-to-agent commerce negotiation platform built on top of PayPal Orders v2."

---

### 0:25 – 0:55 | Buyer Intent & Parallel Multi-Merchant AI Negotiation
* **Visual:** Scroll to the "Live Buyer Journey" on homepage. Enter prompt: `"Developer Laptop under $760"`, set budget ceiling to `$760`, max delivery to `5 days`, choose `PRICE` or `BALANCED` optimization, and click **"Launch Buyer Agent"**.
* **Narrator:**
  > "As a buyer, I define my budget ceiling and delivery constraints. My Buyer Agent discovers live commerce items and negotiates in parallel with multiple PayVia-enabled merchants.
  > 
  > Notice that my private budget ceiling is strictly hidden from the seller agents, while each merchant agent defends its private margin floor rules powered by Google Gemini and deterministic margin engines."

---

### 0:55 – 1:30 | Deterministic Offer Ranking, Selection & Atomic Inventory Lock
* **Visual:** The structured **Multi-Merchant Offer Comparison** table appears. Show the ranked offers, the savings breakdowns ($280.72 vs $800 list), and click **"Select Preferred Offer"**.
* **Narrator:**
  > "The offers are returned and ranked deterministically using normalized composite scoring. When I select the winning offer, PayVia does three critical things:
  > 1. It mints an authoritative Transaction.
  > 2. It seals the terms with a **SHA-256 cryptographic hash** to prevent any client-side tampering.
  > 3. It **atomically reserves inventory** with a 15-minute checkout TTL so the item cannot be oversold to concurrent buyers."

---

### 1:30 – 2:05 | Human Approval Gate & PayPal Orders v2 Settlement
* **Visual:** Review the agreement on the Agreement Review screen ([/agreement](http://localhost:3000/agreement)). Click **"Approve & Pay with PayPal"**, redirect to PayPal Sandbox, approve payment, and land on the verified Confirmation page ([/checkout/success](http://localhost:3000/checkout/success)).
* **Narrator:**
  > "Crucially, PayVia operates on a **Zero-Trust Human Approval Gate**. Autonomous AI agents never move money without human authorization.
  > 
  > Once I inspect the verified terms and approve, PayVia calls PayPal's Orders v2 API. I complete payment via official PayPal Sandbox. The server verifies and captures the payment, consumes the inventory reservation, and triggers the fulfillment engine."

---

### 2:05 – 2:40 | Merchant Command Center (PayVia Connect)
* **Visual:** Navigate to the Merchant Control Plane ([/merchant](http://localhost:3000/merchant)). Show the **Negotiation Rules editor** (adjusting minimum price floors), the **Agent Preview Simulator**, and the **AG Grid & AG Studio** live transactions dashboard.
* **Narrator:**
  > "Now let's switch to the merchant's perspective. With PayVia Connect, merchants can easily make their catalog negotiable.
  > 
  > In the Merchant Control Plane, sellers set minimum price floors, allowable delivery concessions, and margin strategies. Merchants can simulate agent bargaining in real time, and observe every negotiation and settled transaction using enterprise-grade AG Grid and AG Studio analytics."

---

### 2:40 – 3:00 | Summary & Conclusion
* **Visual:** Return to hero section of homepage.
* **Narrator:**
  > "With 150 automated invariant tests passing, cryptographic tamper detection, server-enforced agreement expiry, atomic stock integrity, and official PayPal webhook signature verification, PayVia transforms static commerce into intelligent, secure, conversational transactions.
  > 
  > **AI negotiates. PayPal settles.** Thank you!"

---

## 📋 Live Recording & Demo Checklist

- [x] Node.js v20+ runtime verified (`npm start` or `npm run dev`).
- [x] PayPal Sandbox client ID and secret configured in `.env` or `secrets.txt`.
- [x] 150/150 invariant tests passing (`npm test`).
- [x] Typecheck clean (`npm run typecheck`).
- [x] Secret scanner passed (`npm run check:secrets`).
- [x] Browser tabs pre-loaded:
  1. Tab 1: Home page ([http://localhost:3000](http://localhost:3000))
  2. Tab 2: Merchant Command Center ([http://localhost:3000/merchant](http://localhost:3000/merchant))
  3. Tab 3: Fulfillment Scheduler ([http://localhost:3000/fulfillment](http://localhost:3000/fulfillment))
