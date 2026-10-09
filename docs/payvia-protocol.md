# PayVia Negotiation Protocol Specification ⚡

> **Protocol Version**: 1.0.0

---

## 1. Negotiation Lifecycle State Machine

```text
[ DRAFT ]
    │
    ▼
 [ OPEN ] ◄───────────────────┐
    │                         │
    ├─────────┬───────────────┤
    ▼         ▼               │
[ BUYER_PROPOSED ]  [ MERCHANT_PROPOSED ]
    │                 │
    ├─────────────────┴───────┤ Counter
    ▼                         ▼
[ ACCEPTED ]              [ REJECTED ]
    │
    ▼
[ AGREEMENT_SEALED ] ➔ [ USER_APPROVED ] ➔ [ SETTLED ]
```

---

## 2. Structured Proposal Schema

Proposals are strictly typed data objects, never raw free-text strings:

```json
{
  "id": "prop_1710001001",
  "negotiationId": "neg_1710000999",
  "turnNumber": 2,
  "senderType": "BUYER",
  "price": 752.00,
  "currency": "USD",
  "deliveryDays": 4,
  "paymentTiming": "IMMEDIATE",
  "savings": 48.00,
  "status": "ACCEPTED",
  "reasoningText": "Conceding $12 from previous offer in exchange for 4-day delivery commitment."
}
```

---

## 3. Cryptographic Agreement Seal (`agreementHash`)

Upon proposal acceptance, PayVia generates a canonical SHA-256 hash across all immutable financial terms:

```json
{
  "id": "agr_1710001005",
  "transactionId": "txn_1710000888",
  "negotiationId": "neg_1710000999",
  "platformId": "plat_default",
  "merchantId": "merchant_lenovo",
  "buyerId": "buyer_enterprise_1",
  "currency": "USD",
  "items": [
    {
      "catalogItemId": "prod_thinkpad_x1",
      "quantity": 1,
      "listPrice": 800.00,
      "agreedPrice": 752.00
    }
  ],
  "originalPrice": 800.00,
  "finalPrice": 752.00,
  "deliveryDays": 4,
  "paymentTiming": "IMMEDIATE"
}
```

$$\text{agreementHash} = \text{SHA256}(\text{canonicalizeJson}(\text{terms}))$$

If a client attempts to modify the price before payment, `verifyAgreementHash()` fails and rejects the settlement instantly.
