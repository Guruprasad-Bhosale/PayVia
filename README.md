# PayVia ⚡

> **AI Agent-to-Agent Commerce Negotiation & PayPal Settlement Platform**  
> Built for the **PayPal AI Hackathon 2026**.  
> **Core Promise:** *“AI negotiates. PayPal settles.”*  
> **Status:** 🏆 **150/150 Automated Invariant Tests Passing · Production Build Passing · Zero Credential Leaks**  
> **Pitch & Demo Storyboard:** [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) *(3-minute buyer-to-PayPal demo script & storyboard)*

---

## 💡 Overview

**PayVia** reimagines digital commerce by introducing autonomous **agent-to-agent economic negotiation before payment settlement**.

Instead of rigid static pricing, buyers express their high-level intent and budget bounds. A **Buyer AI Agent** negotiates in parallel across multiple PayVia-enabled merchants, converging on optimal prices, delivery SLAs, and concessions while respecting private merchant floor rules.

Once terms converge:
1. An immutable **SHA-256 cryptographically-sealed Agreement** is minted.
2. Inventory is **atomically reserved** with a checkout TTL to eliminate overselling.
3. The human buyer explicitly reviews and approves the terms through a **Zero-Trust Approval Gate**.
4. The transaction is securely settled through **PayPal Sandbox Orders v2** with **official cryptographic webhook signature verification**.

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

## 🧠 Multi-Sponsor Agentic Architecture

PayVia brings together state-of-the-art AI, vector retrieval, real product discovery, merchant analytics, and project scheduling:

```text
                  Elasticsearch Serverless
                  (Vector & Hybrid Memory)
                             │
                             ▼
                    PayVia Memory Layer
                    /                 \
             Buyer Memory         Merchant Memory
                    \                 /
                     Semantic Retrieval
                             │
                             ▼
User ➔ Product Discovery (Channel3)
  │
  ▼
Buyer AI Agent (Gemini 3.8 Flash + Elastic Memory)
  │
  │ Multi-turn Consensus
  ▼
Negotiation Engine ↔ Merchant AI Agent (Gemini 3.8 Flash + Historical Memory)
  │
  ▼
Final Agreement (Server-side Verified)
  │
  ▼
Explicit User Approval
  │
  ▼
PayPal Orders v2 Sandbox Settlement ➔ Verified Capture Receipt
  │
  ▼
Fulfillment Scheduling Engine (Bryntum Gantt + Fulfillment Memory Logs)
  │
  ▼
Merchant Command Center (AG Grid Community + AG Studio)
```

---

## ⚡ Elasticsearch Serverless AI Memory Layer

PayVia utilizes **Elasticsearch Serverless Vector Database** as an intelligent semantic memory and historical recall layer for autonomous commerce agents.

```text
PayVia Transaction / Settlement
              │
              ▼
    Memory Indexer (Idempotent)
              │
              ▼
 Elasticsearch Serverless (payvia-memory)
              │
              ▼
 Semantic / Hybrid Search & Retrieval
              │
              ▼
 Gemini Buyer / Merchant / Fulfillment Agents
```

### Key Principles & Invariants:
1. **Elasticsearch is NOT the financial source of truth**:
   - **PayPal Orders v2** remains the authoritative payment settlement authority.
   - **PayVia Server-Side Store** remains authoritative for binding agreement terms and merchant floor prices.
2. **Untrusted Data Boundary & Prompt Injection Defense**:
   - Memories are treated strictly as reference data and are fenced inside explicit untrusted data envelopes.
   - Memory documents cannot override system rules, modify pricing floors, or initiate payments.
3. **Non-Blocking Graceful Fallback**:
   - Indexing operations are asynchronous and non-blocking.
   - If Elasticsearch is unavailable or unconfigured, PayVia continues functioning seamlessly with in-memory fallback.
4. **Idempotent Document Storage**:
   - Deterministic document keys (`mem_neg_<id>`, `mem_purchase_<orderId>`, `mem_ful_<id>`) prevent duplicate memory creation across re-renders.
5. **Zero Credentials in Browser**:
   - Elasticsearch credentials are server-only and never exposed via public APIs or client bundles.

### Memory Types:
- `negotiation`: Historical buyer counter-offers, concessions, and savings.
- `purchase`: Verified PayPal sandbox settlement transactions.
- `merchant_pattern`: Category-level discount frequencies and margin insights.
- `fulfillment`: Handover durations, carrier linehaul records, and slack buffers.
- `product`: Channel3 normalized semantic product discovery embeddings.

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
- **AI Engine**: Google Gemini (`@ai-sdk/google`, Vercel AI SDK)
- **Vector AI Memory**: Elasticsearch Serverless Vector Database (`@elastic/elasticsearch`)
- **Product Discovery**: Channel3 Product Data API
- **Payments**: PayPal REST API (Orders v2), PayPal Sandbox
- **Merchant Analytics**: AG Grid Community (`ag-grid-react`) & AG Studio (`ag-studio-react`)
- **Fulfillment Planning**: Bryntum Scheduler / Gantt (`@bryntum/scheduler-trial`)

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
ELASTICSEARCH_URL=https://your-serverless-endpoint.es.io:443
ELASTICSEARCH_API_KEY=your_elasticsearch_api_key
```

### Important Security Rules:
1. **Never commit `secrets.txt`**: It is strictly ignored in `.gitignore`.
2. **Never expose PayPal Client Secret or Elasticsearch API keys**: Kept exclusively within server-side API routes.
3. **Never expose Gemini API keys to client JavaScript**.
4. **Never use `NEXT_PUBLIC_` for private credentials**.
5. **Keep payment operations server-side**: Order creation and capture are performed server-side with zero trust.
6. **Explicit user authorization**: The user must explicitly approve negotiated terms before any payment is initiated.
7. **Rotate exposed credentials**: If sandbox credentials or API keys were previously visible in logs or screenshots, rotate them immediately in the PayPal Developer Dashboard, Google AI Studio, and Elastic Cloud.

Run the security safety scanner at any time:
```bash
npm run check:secrets
```

Run the Elasticsearch live vector probe:
```bash
npm run test:elastic
```

---

## ⚙️ Local Development & Testing

### 1. Prerequisites
- **Node.js**: `>= 20.0.0` (LTS 20.x or 22.x recommended)
- **Package Manager**: `npm` (`>= 9.x`)
- **Database (Optional for Local Dev, Required for Production)**:
  - In local development (`NODE_ENV=development`), PayVia automatically uses fast in-memory repositories if `DATABASE_URL` is omitted.
  - For PostgreSQL persistent testing: PostgreSQL 14+ (local instance or hosted e.g. Neon, Supabase, Render Postgres).

### 2. Clone & Install
```bash
git clone https://github.com/Guruprasad-Bhosale/PayVia.git
cd PayVia
npm install
```
> Note: `npm install` automatically triggers `postinstall: prisma generate` to ensure the Prisma Client bindings match `prisma/schema.prisma`.

### 3. Configure Environment Variables
Copy the environment template to `.env.local` (or `secrets.txt`):
```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:
```properties
# Core PayPal Sandbox (Required for payment settlement)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MERCHANT_EMAIL=your_paypal_business_sandbox_email
PAYPAL_ENVIRONMENT=sandbox

# Google Gemini AI (Required for autonomous Buyer/Merchant negotiation)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key

# Public App Base URL
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional Integrations (Features fallback seamlessly if omitted)
DATABASE_URL=postgresql://postgres:password@localhost:5432/payvia?schema=public
CHANNEL3_API_KEY=your_channel3_api_key_here
ELASTICSEARCH_URL=https://your-serverless-endpoint.es.io:443
ELASTICSEARCH_API_KEY=your_elasticsearch_api_key
```

### 4. Database Setup & Migrations (PostgreSQL Mode)
If using PostgreSQL (`DATABASE_URL` provided):
```bash
# Apply migrations to your PostgreSQL database:
npx prisma migrate deploy

# Generate or update Prisma client bindings:
npx prisma generate
```
*If `DATABASE_URL` is not provided in development mode, PayVia defaults cleanly to in-memory repositories without requiring a local database.*

### 5. Run Security Scans & Test Suite
Verify your setup before launching:
```bash
# 1. Verify that no private credentials or secret files are exposed
npm run check:secrets

# 2. Run TypeScript strict type verification
npm run typecheck

# 3. Execute the automated invariant & security test suite
npm test
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Core Verification Endpoints
- **Service Health Check**: `GET http://localhost:3000/api/health`
- **Gemini AI Connectivity**: `GET http://localhost:3000/api/ai/test`
- **PayPal OAuth2 Connection**: `GET http://localhost:3000/api/paypal/test`
- **Elasticsearch Memory Status**: `GET http://localhost:3000/api/memory/status`

---

## 🔧 Troubleshooting & Operational Fallbacks

| Symptom / Error | Root Cause | Fallback / Resolution |
|---|---|---|
| **Gemini AI 503 / High Demand Spikes** | Google Gemini model endpoint capacity spikes or rate-limiting. | **Handled automatically.** PayVia catches 503/timeouts and falls back to strategic bounded negotiation rules that guarantee seller price floors and buyer budgets are never violated. |
| **Elasticsearch DNS / Unreachable** | Serverless cluster endpoint is asleep, unconfigured, or offline. | **Handled automatically.** Indexing is asynchronous and non-blocking; memory queries gracefully fall back to in-memory semantic memory. |
| **Channel3 Search Timeout / Error** | Network latency or unconfigured API key. | **Handled automatically.** The discovery engine automatically serves the curated PayVia catalog (`SAMPLE_PRODUCTS`). |
| **PayPal OAuth Error (`401 Unauthorized`)** | Invalid Sandbox Client ID or Secret. | Verify that credentials in `.env.local` / `secrets.txt` are from the **Sandbox** tab (not Live) in the PayPal Developer Dashboard. |
| **PayPal Capture Error (`INVALID_RESOURCE_ID`)** | Order already captured or token expired. | PayVia enforces idempotent capture. Ensure the order was approved in Sandbox checkout and captured within the session TTL. |
| **`FATAL: DATABASE_URL is missing in production`** | Running in production (`NODE_ENV=production`) without a database. | **Fail-Closed Security Design.** In production, PayVia requires durable PostgreSQL persistence to avoid silent data loss. Provide a valid `DATABASE_URL` connection string or set `NODE_ENV=development` for local testing. |

---

## 🚀 Deploy to Render (Production Web Service)

PayVia is pre-configured for deployment on **Render** using [render.yaml](render.yaml) as a persistent Node.js Web Service.

### Quick Deploy Steps:
1. Push your repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **PostgreSQL** to create a free PostgreSQL database. Copy its **Internal Database URL**.
4. Click **New +** → **Web Service** and connect your `PayVia` repository.
5. Configure the service settings:
   - **Environment / Runtime**: `Node`
   - **Node Version**: `20` (or `22`)
   - **Build Command**: `npm ci && npm run build` (runs `prisma generate` via postinstall)
   - **Pre-Deploy Command** (Optional): `npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Add the Environment Variables in the Render Dashboard (**Environment** tab):

| Variable | Required in Production | Purpose / Context |
|---|:---:|---|
| `NODE_ENV` | **Yes** | Set to `production`. |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string from Render PostgreSQL (enforces durable settlement persistence; fails closed if omitted). |
| `PAYPAL_CLIENT_ID` | **Yes** | PayPal Sandbox REST API Client ID. |
| `PAYPAL_CLIENT_SECRET` | **Yes** | PayPal Sandbox REST API Client Secret (Server-Only). |
| `PAYPAL_MERCHANT_EMAIL` | **Yes** | PayPal Sandbox Business/Merchant Payee Email. |
| `PAYPAL_ENVIRONMENT` | **Yes** | Set to `sandbox`. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | **Yes** | Google Gemini API Key for Buyer/Merchant/Fulfillment Agents. |
| `APP_URL` | Optional | Custom production domain or let Render auto-detect `RENDER_EXTERNAL_URL`. |
| `CHANNEL3_API_KEY` | Optional | Channel3 live product discovery API key (falls back to catalog if absent). |
| `ELASTICSEARCH_URL` | Optional | Elasticsearch Serverless endpoint (falls back gracefully if absent). |
| `ELASTICSEARCH_API_KEY` | Optional | Elasticsearch Serverless API Key (Server-Only). |
| `PAYPAL_WEBHOOK_ID` | Optional | Webhook ID for signature verification (defaults to sandbox test ID). |

7. Click **Create Web Service** to launch.
8. Verify production deployment:
   - `GET https://<your-service>.onrender.com/api/health` returns `200 OK`.
   - Perform an end-to-end negotiation and PayPal Sandbox settlement from your live URL.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

## 👨‍💻 Built For

**PayPal AI Hackathon 2026** — *Intelligent Agent-to-Agent Commerce & Settlement Layer*.

