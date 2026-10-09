# PayVia API Reference (v1) ⚡

All v1 endpoints support the `Idempotency-Key` request header to guarantee safe retries.

---

## Endpoints Overview

| Method | Endpoint | Description | Idempotent |
|---|---|---|---|
| `POST` | `/api/v1/platforms` | Register an external commerce platform tenant | Yes |
| `GET` | `/api/v1/platforms` | List active platform tenants | Yes |
| `POST` | `/api/v1/merchants` | Register a merchant under a platform | Yes |
| `GET` | `/api/v1/merchants/:id` | Get merchant profile and public policy | Yes |
| `POST` | `/api/v1/catalog/items` | Register a catalog product item | Yes |
| `GET` | `/api/v1/catalog/items` | Search catalog items (Channel3 & catalog) | Yes |
| `POST` | `/api/v1/transactions` | Initialize a transaction from intent | Yes |
| `GET` | `/api/v1/transactions/:id` | Get transaction status | Yes |
| `POST` | `/api/v1/transactions/:id/negotiate` | Start a negotiation session | Yes |
| `GET` | `/api/v1/transactions/:id/audit` | Get transaction audit trail | Yes |
| `GET` | `/api/v1/negotiations/:id` | Get negotiation session & proposal history | Yes |
| `POST` | `/api/v1/negotiations/:id/proposals` | Submit a structured offer or counter | Yes |
| `POST` | `/api/v1/negotiations/:id/accept` | Accept a proposal and seal agreement | Yes |
| `GET` | `/api/v1/agreements/:id` | Get sealed agreement & cryptographic seal | Yes |
| `POST` | `/api/v1/agreements/:id/settle` | Approve agreement and initiate PayPal order | Yes |
| `GET` | `/api/v1/settlements/:id` | Get settlement payment status | Yes |
| `POST` | `/api/v1/webhooks/paypal` | Ingest PayPal webhook events with deduplication | Yes |

---

## Sample Request: Initialize Transaction Intent

```http
POST /api/v1/transactions
Content-Type: application/json
Idempotency-Key: idem_tx_1001

{
  "platformId": "plat_default",
  "buyerId": "buyer_enterprise_1",
  "merchantId": "merchant_default",
  "currency": "USD",
  "items": [
    {
      "catalogItemId": "prod_laptop_pro",
      "title": "AeroBook Pro 16 AI Workstation",
      "quantity": 1,
      "listPrice": 800.00,
      "currency": "USD"
    }
  ],
  "constraints": {
    "maxTotal": 760.00,
    "maxDeliveryDays": 5
  },
  "preferences": {
    "paymentTiming": "IMMEDIATE",
    "deliveryPriority": "HIGH"
  }
}
```
