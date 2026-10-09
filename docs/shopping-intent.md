# PayVia Shopping Intent & Candidate Offer Specification

## Specification Overview

The `ShoppingIntent` and `CandidateOffer` abstractions form the contract between buyers, AI agents, and PayVia's orchestration layer.

---

## 1. ShoppingIntent Schema

```json
{
  "id": "intent_shop_001",
  "buyerId": "buyer_alice_456",
  "platformId": "platform_payvia_main",
  "query": "programming laptop",
  "constraints": {
    "maxTotal": 760.00,
    "maxDeliveryDays": 5,
    "currency": "USD"
  },
  "preferences": {
    "priority": "PRICE",
    "paymentTiming": "IMMEDIATE"
  },
  "quantity": 1,
  "status": "DISCOVERING",
  "createdAt": "2026-10-08T12:00:00.000Z",
  "updatedAt": "2026-10-08T12:00:00.000Z"
}
```

### Deterministic Ranking Priorities
- **`PRICE`**: Sorted ascending by `price`. Strict constraint filtering first.
- **`DELIVERY`**: Sorted ascending by `deliveryDays`. Price acts as secondary tie-breaker.
- **`BALANCED`**: Evaluated deterministically using normalized composite scoring:
  $$\text{Score} = (0.6 \times \text{Normalized Price}) + (0.4 \times \text{Normalized Delivery})$$

*Invariant: AI explains ranking insights, but deterministic code strictly governs offer ordering.*

---

## 2. CandidateOffer Schema

```json
{
  "id": "offer_8f7b2c",
  "sessionId": "sess_shop_123",
  "merchantId": "merchant_apex_tech",
  "catalogItemId": "prod_workstation_16",
  "productTitle": "Apex Pro Laptop 16",
  "originalPrice": 800.00,
  "price": 755.00,
  "savings": 45.00,
  "currency": "USD",
  "deliveryDays": 5,
  "paymentTiming": "IMMEDIATE",
  "negotiable": true,
  "status": "OFFERED",
  "score": 0.94,
  "createdAt": "2026-10-08T12:00:05.000Z"
}
```

### Status Lifecycle
- `DISCOVERED`: Discovered matching catalog item.
- `NEGOTIATING`: Active multi-turn counterproposal with merchant policy.
- `OFFERED`: Consensus reached; structured candidate offer ready for buyer review.
- `SELECTED`: Buyer chose this offer for checkout.
- `REJECTED`: Buyer chose an alternative offer or rejected terms.
- `EXPIRED`: Time-to-live expired.

---

## 3. REST API Surface

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/shopping-intents` | `POST` | Create a new shopping intent |
| `/api/v1/shopping-intents/:id` | `GET` | Get shopping intent status |
| `/api/v1/shopping-intents/:id/discover` | `POST` | Run candidate discovery & initialize session |
| `/api/v1/shopping-sessions/:id` | `GET` | Get session details & candidates |
| `/api/v1/shopping-sessions/:id/negotiate` | `POST` | Run parallel negotiations across PayVia merchants |
| `/api/v1/shopping-sessions/:id/offers` | `GET` | Retrieve ranked candidate offers |
| `/api/v1/shopping-sessions/:id/offers/:offerId/select` | `POST` | Select candidate offer & create authoritative Transaction/Agreement |
| `/api/v1/shopping-sessions/:id/approve` | `POST` | Buyer approves transaction for PayPal settlement |

---

## 4. TypeScript SDK Usage

```typescript
import { PayViaClient } from "@payvia/sdk";

const payvia = new PayViaClient({
  apiKey: "platform_key_acme_live",
  baseUrl: "https://payvia.render.com"
});

// 1. Create Buyer Intent
const intent = await payvia.shopping.createIntent({
  buyerId: "buyer_789",
  query: "programming laptop",
  constraints: { maxTotal: 760, maxDeliveryDays: 5 },
  preferences: { priority: "PRICE" }
});

// 2. Discover Candidates
const session = await payvia.shopping.discover(intent.id);

// 3. Negotiate Across PayVia-enabled Merchants
const negotiatedSession = await payvia.shopping.negotiate(session.id);

// 4. Retrieve Ranked Candidate Offers
const offers = await payvia.shopping.getOffers(session.id);

// 5. Select Best Offer
const selected = await payvia.shopping.selectOffer(session.id, offers[0].id);

// 6. Explicit Human Approval & PayPal Settlement
const approval = await payvia.shopping.approve(session.id);
console.log("Ready for PayPal Settlement:", approval.agreement.finalPrice);
```
