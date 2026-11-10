# PayVia Repository Audit & Cleanup Report

**Date:** November 10, 2026<br />
**Repository:** `https://github.com/Guruprasad-Bhosale/PayVia.git` (`main`)<br />
**Purpose:** Phase 1 repository classification prior to removing promotional media and media-only tooling for final PayPal Hackathon submission and public GitHub presentation.

---

## Executive Summary

An exhaustive audit of tracked and untracked files identified **79 untracked promotional video/audio assets and production scripts** under `evidence/payvia-video/` (~135.25 MB total), **5 untracked root helper scripts** in `scripts/`, **14 tracked launch-film placeholder/production files** (`scripts/video/`, `public/video-assets/`, `public/video-audio/`, `public/video-footage/`, `docs/PRODUCT_LAUNCH_FILM_*`), **2 promo-only devDependencies** (`playwright-core`, `puppeteer-core`) added after `HEAD`, and **1 synthetic video-continuity seed record** in `lib/repositories/in-memory.ts`.

Zero application source files, database migrations, core tests, product evidence screenshots (`evidence/payvia-demo/`), licenses, or secret templates were altered during Phase 1 inspection.

---

## 1. Promotional Media to Remove

All rendered MP4/WebM recordings, raw video captures, synthesized voiceovers/soundtracks, AI-generated cinematography JPG plates, video frame-calibration screenshots, and motion-graphic SVG overlays created strictly for promotional films (`44` untracked files in `evidence/payvia-video/` plus `8` tracked SVGs = `52` media assets):

### Rendered Videos & Raw Screen Captures (`14` files)
- `evidence/payvia-video/payvia-demo-30sec.mp4` (4,476,030 B)
- `evidence/payvia-video/raw-recording.mp4` (2,606,711 B)
- `evidence/payvia-video/part-1/payvia-part-1.mp4` (7,110,467 B)
- `evidence/payvia-video/part-1/raw-recording.mp4` (2,251,221 B)
- `evidence/payvia-video/part-3/payvia-part-3.mp4` (15,901,060 B)
- `evidence/payvia-video/part-3/raw-recording.mp4` (8,789,589 B)
- `evidence/payvia-video/part-3/raw/page@1a80da6d12b65ed7df1842eff111f2b7.webm` (26,626,529 B)
- `evidence/payvia-video/launch-intro/payvia-intro-10s.mp4` (8,911,228 B)
- `evidence/payvia-video/explainer-2/payvia-explainer-10s.mp4` (8,061,001 B)
- `evidence/payvia-video/transition-bridge/payvia-transition-10s.mp4` (5,425,585 B)
- `evidence/payvia-video/closing-finale/payvia-closing-10s.mp4` (5,197,956 B)
- `evidence/payvia-video/screen-recording/payvia-real-product-demo-40sec.mp4` (2,651,038 B)
- `evidence/payvia-video/screen-recording/payvia-paypal-checkout-10sec.mp4` (360,028 B)
- `evidence/payvia-video/screen-recording/payvia-real-product-demo-50sec.mp4` (2,894,331 B)

### Promotional Voiceover & Soundtrack Audio (`8` files)
- `evidence/payvia-video/voiceover-50s/payvia-voiceover-50s.wav` (14,400,102 B)
- `evidence/payvia-video/voiceover-50s/payvia-voiceover-50s.mp3` (2,002,604 B)
- `evidence/payvia-video/launch-intro/audio/master_soundtrack.wav` (1,920,078 B)
- `evidence/payvia-video/launch-intro/audio/vo_pure_charon.wav` (161,638 B)
- `evidence/payvia-video/explainer-2/audio/master_soundtrack.wav` (1,920,078 B)
- `evidence/payvia-video/explainer-2/audio/vo2_take_b.wav` (338,322 B)
- `evidence/payvia-video/transition-bridge/audio/transition_soundtrack.wav` (1,920,044 B)
- `evidence/payvia-video/closing-finale/audio/closing_soundtrack.wav` (1,920,044 B)

### AI Cinematography Scene Plates (`11` files)
- `evidence/payvia-video/launch-intro/plates/scene1a_city_aerial.jpg`
- `evidence/payvia-video/launch-intro/plates/scene1b_logistics.jpg`
- `evidence/payvia-video/launch-intro/plates/scene1c_retail.jpg`
- `evidence/payvia-video/launch-intro/plates/scene1d_mobile_shopper.jpg`
- `evidence/payvia-video/launch-intro/plates/scene2_checkout_freeze.jpg`
- `evidence/payvia-video/launch-intro/plates/scene3_two_architectures.jpg`
- `evidence/payvia-video/launch-intro/plates/scene4_convergence.jpg`
- `evidence/payvia-video/explainer-2/plates/scene3_two_architectures.jpg`
- `evidence/payvia-video/explainer-2/plates/scene4_convergence.jpg`
- `evidence/payvia-video/explainer-2/plates/scene4_hand_approve.jpg`
- `evidence/payvia-video/explainer-2/plates/scene5_settlement_chamber.jpg`

### Video Recording Calibration Screenshots & Vector Motion Graphics (`19` files)
- `evidence/payvia-video/screen-recording/screenshots/*.png` (`11` frame/cursor verification PNGs including Sandbox checkout/review frames superseded by clean `evidence/payvia-demo/` screenshots)
- `public/video-assets/scene1_hook_cards.svg` through `scene8_brand_resolve.svg` (`8` tracked 1080p SVG motion-graphic video overlays)

---

## 2. Media-Generation Code & Promo Documentation to Remove

Scripts, HTML compositors, Python audio builders, coordinate logs, npm scripts/dependencies, and launch-film guides created exclusively to record, render, stitch, or validate promotional media:

### Root & Subdirectory Video/Audio Scripts (`26` files: `5` untracked root helpers, `2` tracked `scripts/video/`, `19` inside `evidence/payvia-video/`)
- `scripts/cut-final-video.js` — FFmpeg segment cutter for `payvia-demo-30sec.mp4`
- `scripts/cut-part1-video.js` — FFmpeg segment cutter for `payvia-part-1.mp4`
- `scripts/cut-part3-video.js` — FFmpeg segment cutter for `payvia-part-3.mp4`
- `scripts/inspect-part1-frames.js` — Frame extractor for Part 1 WebM recording
- `scripts/generate-evidence-package.js` — One-off Puppeteer + `sharp` capture script whose clean PNG outputs are already preserved in `evidence/payvia-demo/`; requires `puppeteer-core` (being removed) and `sharp` (not in `package.json`)
- `scripts/video/build-film.mjs` & `scripts/video/validate-svgs.mjs` — Pre-existing 60s launch-film compositor & SVG audit scripts (tracked)
- `evidence/payvia-video/recording-script.js`
- `evidence/payvia-video/part-1/recording-script.js`
- `evidence/payvia-video/part-3/recording-script.js` & `evidence/payvia-video/part-3/showcase.html`
- `evidence/payvia-video/launch-intro/render_film.html`, `render_frames.mjs`, `build_audio.py`
- `evidence/payvia-video/explainer-2/render_film2.html`, `render_frames2.mjs`, `build_audio2.py`
- `evidence/payvia-video/transition-bridge/render_transition.html`, `render_transition_frames.mjs`, `build_transition_audio.py`
- `evidence/payvia-video/closing-finale/render_closing.html`, `render_closing_frames.mjs`, `build_closing_audio.py`
- `evidence/payvia-video/screen-recording/recording-script.js`, `paypal-checkout-recording-script.ts`
- `evidence/payvia-video/voiceover-50s/generate_voiceover.py`

### Promo Coordinate Logs, Package Metadata & Video-Folder Docs (`20` files + `package.json` keys)
- `evidence/payvia-video/screen-recording/action-log.json`, `cursor-coordinates.json`
- `evidence/payvia-video/voiceover-50s/cue_sheet.json`
- `evidence/payvia-video/` promo markdown docs (`13` files: `README.md`, `TEST-RESULTS.md`, and per-scene `README.md` / `TEST-RESULTS.md` / `TECHNICAL-VERIFICATION.md`)
- `public/video-audio/README.md` & `public/video-footage/README.md` (tracked launch-film empty-directory placeholders)
- `docs/PRODUCT_LAUNCH_FILM_PRODUCTION_GUIDE.md` & `docs/PRODUCT_LAUNCH_FILM_QA_REPORT.md` (tracked docs referencing deleted `public/video-*` and `scripts/video/`)
- `package.json` scripts `"build:video"` and `"audit:video"`
- `package.json` devDependencies `"playwright-core"` and `"puppeteer-core"` (added after `HEAD` strictly for headless video recording/rendering; verified zero imports across `app/`, `components/`, `lib/`, `tests/`, and core `scripts/`)

---

## 3. Temporary Files & Promo Workarounds to Remove

- `continuityAgreementDraft` (`agr_1794294549667_n2rix`) in `lib/repositories/in-memory.ts` — hardcoded agreement seed (`2026-11-10T07:09:09.667Z`) inserted exclusively to bridge the 40s screen recording and 10s PayPal checkout segment. Baseline catalog merchant policies (`pol_merchant_default_*`) in the same initializer are legitimate app defaults and are retained.
- `.gitignore` lines 14–17 (`public/video-footage/*` and `public/video-audio/*` ignore rules), which become obsolete once those video directories are deleted.
- Any empty directories remaining inside `evidence/payvia-video/`, `public/video-assets/`, `public/video-audio/`, `public/video-footage/`, and `scripts/video/`.

---

## 4. Files to Retain

### Product Screenshots & Verification Evidence
- `evidence/payvia-demo/` (`01-payvia-landing.png` through `14-transaction-record.png`, `contact-sheet.png`, `README.md`, `TEST-RESULTS.md`) — Clean `2880×1800` application screenshots free of credentials/personal info, documenting the full PayVia user and merchant workflow.

### Core Application, Tests, Schema & Config
- `app/` (all Next.js App Router pages and API routes including pre-existing uncommitted bug fixes resolving ID lookups, policy SKU scoping, and PayPal double-capture prevention)
- `components/` (UI components, `BuyerAgentPanel`, `MerchantAgentPanel`, `AgreementCard`, `PayPalCheckout`, AG Grid/Studio & Bryntum wrappers, `react-bits/`)
- `lib/` (negotiation engine, domain models, SHA-256 `crypto.ts`, PayPal client/orders, Gemini AI agents, Channel3 & Elasticsearch adapters with graceful fallbacks, services, Prisma & in-memory repositories)
- `data/`, `examples/`, `prisma/` (`schema.prisma`, `seed.ts`, migrations `20260215000000_init` & `20260216000000_audit_event_types`), `types/`
- `tests/` (`negotiation/negotiation.test.ts`, `paypal/paypal.test.ts`)
- Core `scripts/` (`check-secrets.mjs`, `run-tests.mjs`, `test-elastic.mjs`, `test-merchant-policy-integrity.ts`, `test-runner.ts`)
- `public/favicon.svg`, `public/.gitkeep`
- `LICENSE`, `.env.example`, `secrets.example.txt`, `.gitignore`, `.node-version`, `render.yaml`, `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`

### Core Technical & Hackathon Documentation (`docs/`)
- `docs/architecture.md`, `docs/api.md`, `docs/integrations.md`, `docs/negotiation.md`, `docs/payvia-buyer.md`, `docs/payvia-network.md`, `docs/payvia-protocol.md`, `docs/security.md`, `docs/shopping-intent.md`, `docs/DEMO_SCRIPT.md`
- `docs/REPOSITORY_CLEANUP.md` (this audit report)

---

## 5. Ambiguous Files Preserved (Conservative Default)

- **Tracked Engineering Audit & UI Phase Reports in `docs/`:** `docs/PHASE_J_FINAL_VERIFICATION.md`, `docs/SUBMISSION_READINESS_AUDIT.md`, `docs/SUBMISSION_REMEDIATION_REPORT.md`, `docs/UI_REDESIGN_PLAN.md`, `docs/UI_UX_AUDIT.md`, `docs/UI_UX_PHASE_2_REPORT.md` through `docs/UI_UX_PHASE_6_FINAL_QA_REPORT.md` — Already committed on `main`; document concrete architectural verification, WCAG contrast checks, and remediation history, so retained conservatively.
- **UI & Sponsor Packages in `HEAD` (`package.json`):** `@paypal/agent-toolkit`, `ag-studio`, `ag-studio-react`, `gsap`, `@hugeicons/core-free-icons`, `@hugeicons/react`, `motion`, `@bryntum/scheduler`, `@bryntum/scheduler-trial` — Present in `HEAD` before promo recording work (`gsap` and `@hugeicons/*` are actively imported in `components/react-bits/`; others reflect pre-existing project dependencies); retained untouched to avoid breaking builds or pre-existing integrations.
- **Gitignored Local Environment & Build Cache Files:** `.env.local`, `secrets.txt`, `tsconfig.tsbuildinfo` — Present on local disk, already excluded from Git index via `.gitignore`, preserved untouched locally and never staged or committed.
- **External User Artifacts (`C:/Users/Guruprasad/.gemini/antigravity/brain/...`):** Conversation artifact copies outside the Git repository, untouched per instructions.
