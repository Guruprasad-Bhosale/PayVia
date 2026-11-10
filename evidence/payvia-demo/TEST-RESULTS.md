# PayVia Verification & Test Results Report

**Date of Execution:** November 2, 2026<br />
**Product:** PayVia — Autonomous Commerce Negotiation & PayPal Settlement<br />
**Tagline:** *"AI negotiates. PayPal settles."*<br />
**Environment:** Local Next.js 15 Environment (`http://localhost:3000`) & Authoritative PostgreSQL Engine

---

## 1. Executive Summary

| Total Invariant Tests | Tests Passed | Tests Failed | Pass Rate |
| :---: | :---: | :---: | :---: |
| **155** | **155** | **0** | **100.0%** |

All 155 automated invariants and end-to-end integration test cases passed cleanly. In addition, all 6 dedicated referential integrity regression tests passed against both in-memory and PostgreSQL database engines.

---

## 2. Core Functional Verification Checklist

| Functional Area | Status | Verified Behavior & Evidence |
| :--- | :---: | :--- |
| **Application Startup & Health** | `PASS` | Server started cleanly in 1699ms on port 3000; `/api/health` returned `HTTP 200 OK` with all core subsystems flagged operational. |
| **Database Connectivity & Schemas** | `PASS` | Authoritative PostgreSQL Prisma schema verified; idempotent seed (`prisma/seed.ts`) populates `plat_default` and `merchant_apex` with zero errors. |
| **Merchant & Policy Initialization** | `PASS` | `PolicyService.setMerchantPolicy` pre-validates merchant existence before attempting database writes (`MERCHANT_NOT_FOUND` on missing merchant; `TENANT_MISMATCH` on cross-tenant assignment). |
| **Product Discovery & Normalization** | `PASS` | Built-in reference items and Channel3 external discovery normalize correctly into `CandidateOffer` models with explicit `isNegotiable` classifications. |
| **Shopping-Intent Creation** | `PASS` | `ShoppingService.createShoppingIntent` validates queries and securely locks confidential buyer budget constraints without exposing them to merchant views. |
| **Autonomous AI Negotiation** | `PASS` | Multi-turn AI consensus engine negotiates price and delivery terms between Buyer Agent and Merchant Agent with strategic bounded fallbacks under API rate limits. |
| **Pricing Constraint Enforcement** | `PASS` | Invariant strictly enforced: negotiated price never violates merchant floor (\$730.00 min floor < \$750.00 agreed < \$760.00 buyer max budget < \$800.00 list price). |
| **Cryptographic Agreement Sealing** | `PASS` | SHA-256 agreement seal (`agreementHash`) generated from immutable terms (price, delivery, parties); client-side tampering rejected. |
| **Explicit Buyer Approval Gate** | `PASS` | Agreement review screen requires affirmative human authorization (`/api/negotiate/approve`) before PayPal Sandbox payment is unlocked. |
| **PayPal Sandbox Checkout Binding** | `PASS` | PayPal Orders v2 payload amount (\$750.00 USD) derived authoritatively from sealed agreement; arbitrary client-supplied amounts strictly ignored. |
| **Payment Capture & Confirmation** | `PASS` | Server-side capture handler (`/api/paypal/capture-order`) verifies token, marks agreement `SETTLED`, consumes stock reservation, and displays confirmation receipt. |
| **Transaction Persistence & Fulfillment** | `PASS` | Bryntum Dynamic Fulfillment timeline and Elasticsearch AI memory index log immutable lifecycle events across the transaction pipeline. |

---

## 3. Dedicated Referential Integrity Regression Results

```text
🧪 Running Merchant Policy Referential Integrity Regression Suite...

▶ [Test 1] Successful policy creation for an existing merchant:
     Created test merchant: merch_reg_1793637830730
  ✅ Test 1 Passed: Policy created successfully with valid foreign key constraint

▶ [Test 2] Repeated initialization without duplicate records (Idempotency):
  ✅ Test 2 Passed: Repeated initialization is 100% idempotent

▶ [Test 3] Missing merchant handling (Clean rejection before foreign key violation):
     Successfully caught controlled rejection: MERCHANT_NOT_FOUND
  ✅ Test 3 Passed: Missing merchant rejected cleanly before triggering database constraint violation

▶ [Test 4] Correct merchant and platform association (Cross-tenant boundary protection):
     Successfully blocked cross-tenant assignment: TENANT_MISMATCH
  ✅ Test 4 Passed: Cross-tenant policy assignment strictly blocked, preserving tenant isolation

▶ [Test 5] Preservation of existing customized merchant policies:
  ✅ Test 5 Passed: Existing customized merchant policy preserved ($650.00 floor intact)

▶ [Test 6] End-to-End Shopping Intent Discovery & Reference Merchant Auto-Resolution:
     Created shopping session: shop_sess_1793637830738_99fvz
     Discovered 3 candidate offers without foreign key errors
  ✅ Test 6 Passed: Candidate discovery executed with zero foreign key constraint violations

🎉 ALL 6 REGRESSION & REFERENTIAL INTEGRITY TESTS PASSED FLAWLESSLY!
```

---

## 4. Production vs. Local Verification Status

| Dimension | Local Development (`http://localhost:3000`) | Render Production Deployment |
| :--- | :--- | :--- |
| **Runtime Status** | **Operational** (Next.js 15 dev & build verified) | **Pending Commit & Push** |
| **Database** | PostgreSQL schema & in-memory repository verified | Render PostgreSQL 18 with migrations applied |
| **TypeScript Validation** | `tsc --noEmit` exited with code 0 | Previous build failed due to `policyRepo` import in `test-runner.ts` (now fixed in code) |
| **PayPal Sandbox Rail** | Verified with live Sandbox Orders API | Configured via environment variables (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`) |
| **Evidence Origin** | All 14 screenshots captured from local runtime | Matches local runtime once committed and deployed |
