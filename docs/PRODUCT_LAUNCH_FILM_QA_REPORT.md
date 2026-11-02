# PayVia 60-Second Product Launch Film — Quality Assurance & Pipeline Audit Report

> **Project:** PayVia — Autonomous Agent-to-Agent Commerce & Verified PayPal Settlement  
> **Tagline:** AI Negotiates. PayPal Settles.  
> **Target Duration:** 60.00 Seconds exactly  
> **Resolution / Framerate:** 1920 × 1080 @ 30 FPS (16:9 Landscape)  
> **Video / Audio Target:** H.264 MP4 / AAC Stereo 48 kHz (-16 LUFS)  
> **Audit Date:** 2026-10-26  
> **Status:** Production Pipeline Configured • FFmpeg 9.0.1 Operational • All 8 SVGs Validated • Authentic Footage Capture Pending

---

## 1. Executive Summary & Production Status

In strict accordance with the non-negotiable creative rules:
1. **Zero UI Fabrication:** No placeholder mockups, fabricated payment receipts, synthetic browser windows, or fictitious discount percentages have been created.
2. **Deterministic Accounting:** All numbers in the script match real product records in [data/products.ts](file:///g:/PayVia/data/products.ts) (*AeroBook Pro 16 AI Workstation*: Catalog `$800.00`, Budget Ceiling `$760.00`, Merchant Floor `$730.00`, Agreed Price `$750.00`, Savings `$50.00`).
3. **Pipeline Readiness:** The automated rendering pipeline has been established in [scripts/video/build-film.mjs](file:///g:/PayVia/scripts/video/build-film.mjs). FFmpeg 9.0.1 has been installed and verified on the local system.
4. **Current Gate:** Per prompt instructions (*"If the required recordings are not present, stop and report exactly which recordings I need to capture manually"*), rendering is paused until the user records and drops the 9 genuine application screen captures into `public/video-footage/` and audio stems into `public/video-audio/`.

---

## 2. Environment & Tooling Verification

| Component | Target Requirement | Measured / Installed State | Status |
| :--- | :--- | :--- | :---: |
| **FFmpeg Binary** | Executable with H.264 & AAC | `ffmpeg version 9.0.1-essentials_build` (Gyan.dev / WinGet) | **PASSED** |
| **FFprobe Binary** | Media inspection tool | `ffprobe version 9.0.1` | **PASSED** |
| **Node.js Runtime** | Node >= 20.0.0 | Node v20.x on Windows | **PASSED** |
| **Rendering Scripts** | Reproducible CLI pipeline | `npm run audit:video` and `npm run build:video` | **PASSED** |
| **Output Directory** | Target output destination | `dist/payvia-launch-film.mp4` (git-ignored) | **PASSED** |
| **Asset Directory** | 1080p SVG overlays | `public/video-assets/` (8 files) | **PASSED** |
| **Footage Directory** | Raw screen recordings | `public/video-footage/` (git-ignored) | **PASSED** |
| **Audio Directory** | Audio stems & SFX | `public/video-audio/` (git-ignored) | **PASSED** |

---

## 3. Motion-Graphics SVG Assets Verification

All eight vector motion-graphic overlays in `public/video-assets/` were audited via [scripts/video/validate-svgs.mjs](file:///g:/PayVia/scripts/video/validate-svgs.mjs):

| Asset File | Target Scene | Canvas / ViewBox | Typography | Safe Zone (80%) | Validation Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| [`scene1_hook_cards.svg`](file:///g:/PayVia/public/video-assets/scene1_hook_cards.svg) | Scene 1 (00:00–00:05) | `0 0 1920 1080` | Inter (800 / 600) | Center 70% | **0 Errors, Valid** |
| [`scene2_meet_payvia_overlay.svg`](file:///g:/PayVia/public/video-assets/scene2_meet_payvia_overlay.svg) | Scene 2 (00:05–00:11) | `0 0 1920 1080` | Inter (700 / 800) | Top Left Safe Margin | **0 Errors, Valid** |
| [`scene3_editorial_labels.svg`](file:///g:/PayVia/public/video-assets/scene3_editorial_labels.svg) | Scene 3 (00:11–00:18) | `0 0 1920 1080` | Inter (700 / 800) | Right Margin Safe Zone | **0 Errors, Valid** |
| [`scene4_agent_flow_diagram.svg`](file:///g:/PayVia/public/video-assets/scene4_agent_flow_diagram.svg) | Scene 4 (00:18–00:29) | `0 0 1920 1080` | Inter + JetBrains Mono | Top Banner & Center Lower | **0 Errors, Valid** |
| [`scene5_human_approval_overlay.svg`](file:///g:/PayVia/public/video-assets/scene5_human_approval_overlay.svg) | Scene 5 (00:29–00:37) | `0 0 1920 1080` | Inter (700 / 900) | Center Lower Third | **0 Errors, Valid** |
| [`scene6_settlement_badge.svg`](file:///g:/PayVia/public/video-assets/scene6_settlement_badge.svg) | Scene 6 (00:37–00:45) | `0 0 1920 1080` | Inter (700 / 800) | Bottom Left Safe Zone | **0 Errors, Valid** |
| [`scene7_control_plane_overlay.svg`](file:///g:/PayVia/public/video-assets/scene7_control_plane_overlay.svg) | Scene 7 (00:45–00:52) | `0 0 1920 1080` | Inter (700 / 800) | Top Center Banner | **0 Errors, Valid** |
| [`scene8_brand_resolve.svg`](file:///g:/PayVia/public/video-assets/scene8_brand_resolve.svg) | Scene 8 (00:52–01:00) | `0 0 1920 1080` | Inter (900) + JetBrains | Center 60% Safe Title Zone | **0 Errors, Valid** |

---

## 4. Scene Duration & Timing Mathematical Check

The scene timings proposed in the production guide were audited to ensure they total **exactly 60.00 seconds**:

$$\begin{aligned}
\text{Scene 1: The Hook} &= 5.00\,\text{s} \quad (00:00.00 - 00:05.00) \\
\text{Scene 2: Introducing PayVia} &= 6.00\,\text{s} \quad (00:05.00 - 00:11.00) \\
\text{Scene 3: Buyer Objective} &= 7.00\,\text{s} \quad (00:11.00 - 00:18.00) \\
\text{Scene 4: Agents Negotiate} &= 11.00\,\text{s} \quad (00:18.00 - 00:29.00) \\
\text{Scene 5: Human Approval Gate} &= 8.00\,\text{s} \quad (00:29.00 - 00:37.00) \\
\text{Scene 6: PayPal Settlement} &= 8.00\,\text{s} \quad (00:37.00 - 00:45.00) \\
\text{Scene 7: Commerce Control Plane} &= 7.00\,\text{s} \quad (00:45.00 - 00:52.00) \\
\text{Scene 8: Final Brand Reveal} &= 8.00\,\text{s} \quad (00:52.00 - 01:00.00) \\
\hline
\mathbf{Total\ Film\ Runtime} &= \mathbf{60.00\,\text{seconds}\ (1,800\ \text{frames}\ @\ 30\ \text{FPS})}
\end{aligned}$$

---

## 5. Authentic Product Footage Capture Protocol

To complete rendering without fabricating a single pixel, capture the following 9 authentic screen recordings from the running application:

### Prerequisites:
1. Start local dev server: `npm run dev` (running at `http://localhost:3000`).
2. Browser: Google Chrome or Microsoft Edge in full-screen window (1920 × 1080, 100% zoom, bookmarks & extension icons hidden).
3. Frame rate: 30 FPS or 60 FPS (H.264 MP4).

| Shot ID | File Name | Route | Duration | Exact Capture Action & Interactions |
| :---: | :--- | :--- | :---: | :--- |
| **SR-01** | `sr01_homepage_hero.mp4` | `http://localhost:3000/` | 6.0s | Smooth cursor movement over the top nav brand logo, gliding down to the hero text and shopping intent composer. |
| **SR-02** | `sr02_shopping_intent_input.mp4` | `http://localhost:3000/` or `/negotiate` | 7.0s | Click input field. Type: `"Lightweight laptop for college"`. Budget: `$760.00`. SLA: `5 business days`. Click primary CTA `[Find my deal]`. Keep recording as loading state starts. |
| **SR-03** | `sr03_offer_comparison_table.mp4` | `http://localhost:3000/negotiate` | 3.5s | Wide view of candidate offers table. Highlight *AeroBook Pro 16 AI Workstation* with catalog price `$800.00`, negotiated price `$750.00`, savings pill `Save $50.00 (6%)`, and `AI Negotiated` badge. |
| **SR-04** | `sr04_offer_selected.mp4` | `http://localhost:3000/negotiate` | 7.5s | Closer view of the winning offer card. Move cursor purposefully and click `[Select Preferred Offer]`. Card highlights in blue and transitions to `[Review Agreement & Pay]`. |
| **SR-05** | `sr05_agreement_approval.mp4` | `http://localhost:3000/agreement?id=agree_laptop_8821` | 8.0s | Scroll smoothly past the 5-tier terms breakdown and green SHA-256 agreement verification badge. At 00:34 mark, cursor clicks `[Approve agreement & continue to PayPal]`. |
| **SR-06** | `sr06_paypal_checkout.mp4` | PayPal Sandbox hosted checkout | 4.0s | Display the PayPal Sandbox order review screen for `$750.00 USD` (passwords/credentials kept off-screen). Click `[Pay Now]` to authorize. |
| **SR-07** | `sr07_confirmed_receipt.mp4` | `http://localhost:3000/checkout/success` | 4.0s | Confirmed receipt view showing green checkmark, PayPal Order ID, Capture ID, and status `Payment Completed & Verified`. |
| **SR-08** | `sr08_merchant_dashboard.mp4` | `http://localhost:3000/merchant` | 3.5s | Smooth pan across Merchant Control Plane showing price floor editor (`Floor: $730.00`), active catalog inventory, and AG Grid settlement ledger. |
| **SR-09** | `sr09_fulfillment_stepper.mp4` | `http://localhost:3000/fulfillment` | 3.5s | Milestone stepper showing 5 stages (`Order Placed ➔ Stock Reserved ➔ Payment Settled ➔ Packing ➔ Carrier Handover`) and Bryntum Gantt schedule. |

---

## 6. Audio Stems Specification

Place the following audio files into `public/video-audio/`:

| Stem ID | File Name | Format | Specifications & Sonic Direction |
| :---: | :--- | :---: | :--- |
| **VO-01** | `voiceover_60s.wav` (or `.mp3`) | 48 kHz / 24-bit Mono | Master narration spoken to the 94-word script timed exactly to second markers (loudness: -16 LUFS). |
| **MUS-01** | `music_bed_112bpm.wav` (or `.mp3`) | 48 kHz Stereo | Licensed instrumental fintech track. Starts subtle at -18 dB, ducks to -24 dB under dialogue, builds at agreement approval, resolves on final major chord. |
| **SFX-01** | `sfx_sub_impact.wav` | 48 kHz Stereo | 40 Hz deep cinematic impact for Scene 1 opener at 00:00.00 (-12 dB). |
| **SFX-02** | `sfx_button_click.wav` | 48 kHz Stereo | Crisp, tactile UI click for agreement approval at 00:34.50 (-18 dB). |
| **SFX-03** | `sfx_confirm_chime.wav` | 48 kHz Stereo | Gentle two-tone digital confirmation tone for settlement return at 00:42.00 (-14 dB). |

---

## 7. Rendering & Assembly Execution

Once the 9 footage files and audio files are dropped into their respective directories:

```bash
# 1. Validate SVG assets and footage audit
npm run audit:video

# 2. Execute automated FFmpeg composite and export master film
npm run build:video
```

### Output Destination:
```
dist/payvia-launch-film.mp4
  Codec: H.264 (High Profile, Level 4.2)
  Pixel Format: yuv420p
  Resolution: 1920 × 1080
  Frame Rate: 30.00 FPS constant
  Audio: AAC Stereo 320 kbps @ 48 kHz
  Duration: Exactly 60.00 seconds
```

---

## 8. Remaining Limitations & Non-Negotiables

* **No Automated Financial Execution:** In compliance with security requirements, the AI assistant will not automate live PayPal checkout authorizations without explicit user oversight.
* **No Fabricated Media:** The rendering pipeline strictly refuses to substitute canned stock footage or generated mockups for real PayVia product screens.
* **No Premature Release:** The final video file will remain locally in `dist/` and will not be pushed, uploaded, or published without the user's explicit consent.
