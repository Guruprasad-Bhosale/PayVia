# Payvia Architecture Documentation

## 1. System Vision

Payvia is an autonomous agent-to-agent negotiation and settlement layer built atop the PayPal REST API. It bridges buyer preferences with merchant sales policies via structured multi-turn agent conversations, culminating in an explicitly authorized, verifiable PayPal payment order.

---

## 2. Core Entities & Roles

```
┌────────────────────────────────────────────────────────┐
│                       End User                         │
│   (Defines budget, items, timeline, payment bounds)    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Buyer AI Agent                        │
│ - Evaluates buyer utility                              │
│ - Crafts initial offer & counter-proposals             │
│ - Adheres strictly to ceiling budget & constraints     │
└──────────────────────────┬─────────────────────────────┘
                           │ (Bargaining Protocol)
                           ▼
┌────────────────────────────────────────────────────────┐
│                 Merchant AI Agent                      │
│ - Defends merchant floor margin                        │
│ - Evaluates bundle value, shipping, delivery tier      │
│ - Formulates concessions or rejects non-viable bids    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ (Agreed Terms)
┌────────────────────────────────────────────────────────┐
│               Human-in-the-Loop Gate                   │
│ - User explicitly reviews & approves final agreement   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               PayPal Settlement Engine                 │
│ - Server-side Orders v2 Creation                       │
│ - Client-side PayPal SDK Interaction                   │
│ - Server-side Payment Capture & Audit Confirmation     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Negotiation Protocol Specification

1. **Initiation**: The buyer provides a target item, budget range ($B_{min} \dots B_{max}$), delivery constraints, and priority weights.
2. **Turn-Taking Protocol**:
   - Round $t$: Buyer Agent generates structured proposal $P_t = (\text{price}, \text{delivery\_tier}, \text{addons})$.
   - Merchant Agent evaluates $P_t$ against inventory floor $M_{min}$, margin goals, and acceptable perks.
   - Merchant Agent responds with: `ACCEPT`, `REJECT`, or `COUNTER_OFFER(P'_{t})`.
3. **Termination**:
   - `AGREEMENT_REACHED`: Both parties converge on price $P^* \le B_{max}$ and $P^* \ge M_{min}$.
   - `DEADLOCK`: Maximum rounds exceeded or bottom line breach; negotiation safely halts without charges.

---

## 4. Payment Execution Pipeline

- **Server-Side Order Creation (`/api/paypal/create-order`)**:
  - Validates signed agreement token / payload.
  - Contacts PayPal Orders v2 endpoint with negotiated amount and merchant breakdown.
  - Returns `orderID` to frontend.
- **Client-Side Authorisation (`components/PayPalCheckout.tsx`)**:
  - Renders official PayPal Buttons targeting Sandbox environment.
  - Captures approval from customer.
- **Server-Side Capture (`/api/paypal/capture-order`)**:
  - Securely calls `POST /v2/checkout/orders/{id}/capture` with server-side bearer token.
  - Stores transaction record and issues completion receipt.

---

## 5. Security & Boundary Enforcement

- **Secrets Isolation**: No secret keys (`PAYPAL_CLIENT_SECRET`, `AI_API_KEY`) reside in client code or bundle.
- **Zod Schema Verification**: All inbound negotiation and payment payloads are strictly validated before processing.
