# PayVia ⚡

> **AI-Powered Agent-to-Agent Payment Negotiation Platform**

Built for the **PayPal AI Hackathon**.

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

🚀 Core Concept
Instead of:
Customer → Merchant → Payment

PayVia enables:
Buyer Agent ↔ Merchant Agent
                  ↓
            Negotiated Terms
                  ↓
            User Approval
                  ↓
             PayPal Payment

Example
A user tells PayVia:
"Buy this laptop. My maximum budget is ₹80,000 and I can wait up to 5 days."

The agents might negotiate:
Buyer Agent:
₹75,000 with 5-day delivery

Merchant Agent:
₹82,000 with 5-day delivery

Buyer Agent:
₹78,500 with 5-day delivery

Merchant Agent:
Accepted.

Final agreement:
Product: Laptop
Original Price: ₹84,999
Negotiated Price: ₹78,500
Savings: ₹6,499
Delivery: 5 days
Payment: PayPal

The user then explicitly approves the transaction before PayVia creates and captures the PayPal payment.
✨ Key Features
- 🤖 AI-powered Buyer Agent
- 🤝 AI-powered Merchant Agent
- 💬 Agent-to-agent price negotiation
- 🔄 Offer and counter-offer negotiation loop
- 📋 Structured negotiation agreements
- 🛡️ Server-side validation of negotiated terms
- 👤 Explicit user approval before payment
- 💳 PayPal Sandbox payment processing
- 🔐 Secure server-side credential handling
- 📊 Transparent negotiation timeline
🧠 AI Architecture
PayVia uses an AI model to power the negotiation agents.
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

The AI is responsible for reasoning about offers and producing structured negotiation decisions.
The application backend remains responsible for enforcing hard constraints.
For example:
finalPrice <= buyerMaximum
finalPrice >= merchantMinimum
deliveryDays <= buyerMaximumDeliveryDays

The AI cannot override these application-level constraints.
💳 PayPal Integration
PayVia uses the PayPal Developer Platform and PayPal Sandbox for payment processing.
The payment flow is:
Negotiation Complete
        ↓
User Approval
        ↓
Create PayPal Order
        ↓
Sandbox Approval
        ↓
Capture PayPal Order
        ↓
Payment Confirmation

No real money is used during development.
🛠️ Tech Stack
Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
Backend
- Next.js API Routes
- TypeScript
- Zod
AI
- Google Gemini
- Vercel AI SDK
- PayPal Agent Toolkit
Payments
- PayPal REST API
- PayPal Orders API
- PayPal Sandbox
Development
- Node.js
- npm
- Git
- GitHub
📁 Project Structure
PayVia/
│
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   │
│   ├── negotiate/
│   │   └── page.tsx
│   │
│   ├── agreement/
│   │   └── page.tsx
│   │
│   ├── checkout/
│   │   └── page.tsx
│   │
│   └── api/
│       ├── health/
│       │   └── route.ts
│       │
│       ├── negotiate/
│       │   └── route.ts
│       │
│       └── paypal/
│           ├── create-order/
│           │   └── route.ts
│           │
│           └── capture-order/
│               └── route.ts
│
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── input.tsx
│   │
│   ├── ProductCard.tsx
│   ├── BuyerAgentPanel.tsx
│   ├── MerchantAgentPanel.tsx
│   ├── NegotiationTimeline.tsx
│   ├── AgreementCard.tsx
│   └── PayPalCheckout.tsx
│
├── lib/
│   ├── ai/
│   │   ├── buyer-agent.ts
│   │   ├── merchant-agent.ts
│   │   ├── negotiation-engine.ts
│   │   └── prompts.ts
│   │
│   ├── paypal/
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── orders.ts
│   │   └── types.ts
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── validation/
│   │   ├── negotiation.ts
│   │   └── payment.ts
│   │
│   └── utils/
│       └── index.ts
│
├── types/
│   ├── agent.ts
│   ├── negotiation.ts
│   ├── payment.ts
│   └── product.ts
│
├── data/
│   ├── products.ts
│   └── merchant-config.ts
│
├── tests/
│   ├── negotiation/
│   │   └── negotiation.test.ts
│   │
│   └── paypal/
│       └── paypal.test.ts
│
├── docs/
│   ├── architecture.md
│   └── security.md
│
├── scripts/
│   └── check-secrets.mjs
│
├── secrets.txt
├── secrets.example.txt
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
└── README.md

🔐 Security
Sensitive credentials must never be committed to the repository.
Local secrets are stored in:
secrets.txt

Required credentials include:
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
GEMINI_API_KEY=

secrets.txt is ignored by Git.
Important Security Rules
- Never commit secrets.txt
- Never expose PayPal Client Secret to browser code
- Never expose Gemini API keys to client-side code
- Never use NEXT_PUBLIC_ for private credentials
- Keep payment operations server-side
- Require explicit user approval before executing a payment
- Validate negotiated terms on the server
- Rotate credentials immediately if they are accidentally exposed
Run the security check with:
npm run check:secrets

⚙️ Local Development
1. Clone the repository
git clone <your-repository-url>
cd PayVia

2. Install dependencies
npm install

3. Configure secrets
Create:
secrets.txt

and add:
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
GEMINI_API_KEY=your_gemini_api_key

4. Check secrets
npm run check:secrets

5. Run type checking
npm run typecheck

6. Start development server
npm run dev

Open:
http://localhost:3000

🧪 Testing
Run type checking:
npm run typecheck

Run the secret safety check:
npm run check:secrets

Run tests:
npm test

Build the application:
npm run build

🗺️ Development Roadmap
Phase 1 — Foundation
- [x] Project structure
- [x] Next.js setup
- [x] TypeScript configuration
- [x] Secret management
- [x] PayPal Developer application
- [x] Gemini API setup
Phase 2 — AI Negotiation
- [ ] Gemini integration
- [ ] Buyer Agent
- [ ] Merchant Agent
- [ ] Negotiation state
- [ ] Offer/counter-offer system
- [ ] Hard constraint validation
- [ ] Negotiation termination rules
Phase 3 — PayPal
- [ ] PayPal authentication
- [ ] Create sandbox order
- [ ] Sandbox approval
- [ ] Capture payment
- [ ] Payment confirmation
- [ ] Error handling
Phase 4 — Product Experience
- [ ] Product selection
- [ ] Buyer preferences
- [ ] Negotiation timeline
- [ ] Final agreement screen
- [ ] Payment confirmation
- [ ] Error and recovery states
Phase 5 — Hackathon Polish
- [ ] Security review
- [ ] Automated tests
- [ ] Demo flow
- [ ] Architecture documentation
- [ ] Demo video
- [ ] Final presentation
🎯 Hackathon Vision
PayVia explores a future where software agents can negotiate economic terms on behalf of people while keeping humans in control of the final financial decision.
The goal is not simply to add AI to checkout.
The goal is to make negotiation itself an intelligent part of commerce.
Human Intent
     ↓
AI Negotiation
     ↓
Mutually Accepted Terms
     ↓
Human Authorization
     ↓
Payment Settlement

📄 License
This project is released under the MIT License.
👨‍💻 Built For
PayPal AI Hackathon
Built with ❤️ using AI, agent technology, and PayPal.
```
