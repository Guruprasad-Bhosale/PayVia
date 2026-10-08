# PayVia ⚡

> **AI-Powered Agent-to-Agent Payment Negotiation Platform**
> Built for the **PayPal AI Hackathon**.

---

## 💡 Overview

**PayVia** reimagines digital commerce by introducing autonomous **agent-to-agent negotiation before payment settlement**.

A buyer defines their purchasing preferences and constraints such as:
- Maximum budget
- Delivery deadline
- Payment preferences
- Negotiation flexibility

The **Buyer AI Agent** negotiates directly with the **Merchant AI Agent**, which has its own constraints such as:
- Minimum acceptable price
- Delivery options
- Settlement preferences
- Payment terms

The agents exchange offers and counter-offers until they reach an agreement or determine that no acceptable deal exists.

Once an agreement is reached, the user explicitly approves the transaction and the final payment is executed through **PayPal Sandbox**.

```text
User
  │
  ▼
Buyer AI Agent
  │
  │ Offer / Counter-offer
  ▼
Negotiation Engine
  │
  │ Offer / Counter-offer
  ▼
Merchant AI Agent
  │
  ▼
Final Agreement
  │
  ▼
Explicit User Approval
  │
  ▼
PayPal Sandbox
  │
  ▼
Payment Settlement
```

---

## 🚀 Core Concept

Instead of:
```
Customer → Merchant → Payment
```

PayVia enables:
```
Buyer Agent ↔ Merchant Agent
      ↓
Negotiated Terms
      ↓
User Approval
      ↓
PayPal Sandbox Payment
```

---

## ✨ Key Features

- 🤖 **AI-powered Buyer Agent**: Dynamically negotiates favorable prices and shipping perks.
- 🤝 **AI-powered Merchant Agent**: Protects profit margins, enforces floor prices, and counters intelligently.
- 💬 **Agent-to-Agent Protocol**: Multi-turn dialogue with utility-based proposal evaluation.
- 📋 **Structured Negotiation Agreements**: Immutable agreement summaries with itemized savings.
- 🛡️ **Zero-Trust Hard Constraints**: Strict server-side verification guaranteeing that agent negotiations cannot violate user budget ceilings or seller floor prices.
- 👤 **Explicit User Approval Gate**: No payment is ever executed without human consent.
- 💳 **Authentic PayPal Sandbox Integration**: Server-side Orders v2 creation, client redirection, and server-side capture verification.
- 🔐 **Zero-Leak Credential Security**: Server-only isolation of PayPal Client Secret and Gemini API keys.
- 📊 **Transparent Negotiation Transcript**: Real-time auditable record of all agent counter-offers.

---

## 🧠 AI Architecture

PayVia uses Google Gemini models to power the negotiation agents.

```text
                  Gemini
                    │
          ┌─────────┴─────────┐
          │                   │
     Buyer Agent         Merchant Agent
          │                   │
          └─────────┬─────────┘
                    │
             Negotiation Engine
                    │
             Final Agreement
```

The AI is responsible for reasoning about offers and producing structured negotiation decisions.
The application backend remains responsible for enforcing hard constraints:
- `finalPrice <= buyerMaximum`
- `finalPrice >= merchantMinimum`
- `deliveryDays <= buyerMaximumDeliveryDays`

The AI cannot override these application-level constraints.

---

## 🛍️ Channel3 Product Discovery

PayVia uses the official **Channel3 Product Data API** as an intelligent shopping and live product discovery layer before AI negotiation.

```text
User Shopping Intent (Natural Language Search)
        ↓
Channel3 Product Discovery (POST /v1/search)
        ↓
PayVia Product Normalization (Deterministic Floor Policy)
        ↓
Buyer AI Agent ↔ Merchant AI Agent (Google Gemini)
        ↓
Structured Agreement Review & Human Approval
        ↓
PayPal Sandbox Settlement (Orders v2)
```

- **Live Marketplace Search**: Discovers live product listings across e-commerce merchants.
- **Strict Data Normalization**: Separates external marketplace product attributes from server-side negotiation constraints.
- **Graceful Offline Fallback**: Falls back to the curated PayVia demo catalog if live discovery is unconfigured or temporarily unavailable.

---

## 💳 PayPal Sandbox Integration Flow

PayVia connects directly to the official PayPal REST API (Orders v2) targeting the Sandbox environment.

```text
Negotiation Complete
        ↓
User Explicit Approval
        ↓
Create PayPal Order (POST /api/paypal/create-order)
        ↓
Sandbox Approval (Redirect to PayPal Sandbox)
        ↓
Capture PayPal Order (GET /api/paypal/capture-order)
        ↓
Payment Confirmation & Verified Receipt
```

*Note: PayVia uses USD for sandbox demonstration transactions. No real funds are moved.*


---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Next.js API Routes (Server Components / Handlers), TypeScript, Zod
- **AI Engine**: Google Gemini (`@ai-sdk/google`, Vercel AI SDK)
- **Payments**: PayPal REST API (Orders v2), PayPal Sandbox

---

## 📁 Project Structure

```text
PayVia/
├── app/
│   ├── page.tsx                    # Landing Page & overview
│   ├── layout.tsx                  # Root layout & navbar
│   ├── globals.css                 # Styling & design system
│   ├── negotiate/page.tsx          # Agent negotiation interface
│   ├── agreement/page.tsx          # Terms review & approval screen
│   ├── checkout/
│   │   ├── page.tsx                # PayPal checkout screen
│   │   └── success/page.tsx        # Verified payment confirmation receipt
│   └── api/
│       ├── ai/test/route.ts        # Gemini connection test route
│       ├── health/route.ts         # Service & environment health
│       ├── negotiate/route.ts      # Agent negotiation endpoint
│       └── paypal/
│           ├── test/route.ts       # PayPal OAuth2 connection test route
│           ├── create-order/route.ts # Server-side PayPal order creation
│           ├── capture-order/route.ts# Server-side PayPal capture & return handler
│           └── cancel/route.ts     # PayPal checkout cancellation handler
├── components/
│   ├── ui/                         # Reusable UI primitives (Button, Card, Badge, Input)
│   ├── ProductCard.tsx             # Product display
│   ├── BuyerAgentPanel.tsx         # Buyer Agent configuration
│   ├── MerchantAgentPanel.tsx      # Merchant Agent floor policy
│   ├── NegotiationTimeline.tsx     # Turn-by-turn dialogue stream
│   ├── AgreementCard.tsx           # Finalized terms card
│   └── PayPalCheckout.tsx          # PayPal Sandbox payment launcher
├── lib/
│   ├── ai/
│   │   ├── buyer-agent.ts          # Buyer Agent logic
│   │   ├── merchant-agent.ts       # Merchant Agent policy
│   │   ├── negotiation-engine.ts   # Multi-turn negotiation orchestrator
│   │   ├── prompts.ts              # Agent system instructions
│   │   └── gemini-test.ts          # Gemini verification helper
│   ├── paypal/
│   │   ├── auth.ts                 # Server-side OAuth2 token manager
│   │   ├── client.ts               # Authenticated PayPal REST client
│   │   ├── orders.ts               # PayPal Orders v2 integration
│   │   └── types.ts                # TypeScript definitions for PayPal API
│   ├── config/
│   │   └── env.ts                  # Server environment loader & secret assertions
│   ├── validation/
│   │   ├── negotiation.ts          # Zod negotiation schemas
│   │   └── payment.ts              # Zod payment schemas
│   └── utils/
│       └── index.ts                # Utilities & formatters
├── types/                          # Shared TypeScript definitions
├── data/                           # Mock product catalog & store policies
├── docs/                           # Architecture & Security documentation
├── scripts/
│   └── check-secrets.mjs           # Automated secret safety check
├── secrets.txt                     # Local-only development secrets (GITIGNORED)
├── secrets.example.txt             # Safe template for version control
├── .env.example                    # Safe environment template
└── .gitignore                      # Git ignore rules
```

---

## 🔐 Security & Secrets Management

Sensitive credentials must **NEVER** be committed to Git.

Local secrets are stored in:
```
secrets.txt
```

### Required Credentials:
```properties
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
PAYPAL_MERCHANT_EMAIL=your_paypal_business_sandbox_email
CHANNEL3_API_KEY=your_channel3_api_key_here
```

### Important Security Rules:
1. **Never commit `secrets.txt`**: It is strictly ignored in `.gitignore`.
2. **Never expose PayPal Client Secret**: Kept exclusively within server-side API routes.
3. **Never expose Gemini API keys to client JavaScript**.
4. **Never use `NEXT_PUBLIC_` for private credentials**.
5. **Keep payment operations server-side**: Order creation and capture are performed server-side with zero trust.
6. **Explicit user authorization**: The user must explicitly approve negotiated terms before any payment is initiated.
7. **Rotate exposed credentials**: If sandbox credentials or API keys were previously visible in logs or screenshots, rotate them immediately in the PayPal Developer Dashboard and Google AI Studio.

Run the security safety scanner at any time:
```bash
npm run check:secrets
```

---

## ⚙️ Local Development & Testing

### 1. Clone & Install
```bash
git clone <your-repository-url>
cd PayVia
npm install
```

### 2. Configure Secrets
Create `secrets.txt` in the project root:
```properties
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
PAYPAL_MERCHANT_EMAIL=your_paypal_business_sandbox_email
CHANNEL3_API_KEY=your_channel3_api_key_here
```

### 3. Run Security & Type Checks
```bash
npm run check:secrets
npm run typecheck
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Verify Integration Endpoints
- **Gemini AI Connection**: `GET http://localhost:3000/api/ai/test`
- **PayPal OAuth2 Connection**: `GET http://localhost:3000/api/paypal/test`
- **PayPal Order Creation**: `POST http://localhost:3000/api/paypal/create-order`

---

## 🧪 Production Build

```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Built For

**PayPal AI Hackathon** — *Intelligent Agent-to-Agent Commerce & Settlement Layer*.
