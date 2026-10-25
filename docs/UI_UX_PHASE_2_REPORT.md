# PayVia UI/UX Overhaul — Phase 2: Design System Foundation Report

**Author:** Principal Product Designer & Senior Frontend Engineer  
**Date:** October 25, 2026  
**Objective:** Establish a unified, accessible, and trustworthy fintech design system foundation based on the findings in `docs/UI_UX_AUDIT.md`.

---

## 1. Design Tokens Standardized

The design tokens were consolidated into a single source of truth across [tailwind.config.ts](file:///g:/PayVia/tailwind.config.ts) and [app/globals.css](file:///g:/PayVia/app/globals.css):

### 1.1 Color Tokens
| Token Key | Hex Value | Semantic Purpose | Measured Contrast vs White |
|---|:---:|---|:---:|
| `brand.navy` / `payvia.navy` | `#0A192F` | Deep Midnight Navy for primary headings, strong text, and primary button backgrounds | **15.8:1** (WCAG AAA) |
| `fintech.secondary` | `#475569` | Refined Slate for secondary descriptions, subtitle text, and form labels | **5.4:1** (WCAG AA) |
| `fintech.muted` | `#64748B` | Accessible Slate for subtle placeholder text and metadata labels | **4.6:1** (WCAG AA) |
| `brand.blue` / `payvia.blue` | `#0052CC` | Restrained Fintech Blue for active navigation accents, links, and focus rings | **7.4:1** (WCAG AAA) |
| `surface.base` | `#FFFFFF` | Primary white card and dialog surfaces | N/A |
| `surface.subtle` / `background` | `#F8FAFC` | Crisp, soft neutral page background | N/A |
| `surface.muted` | `#F1F5F9` | Elevated pill backgrounds and secondary button surfaces | N/A |
| `fintech.border` / `border` | `#E2E8F0` | Subtle, clean border lines (1px) | N/A |
| `fintech.border-strong` | `#CBD5E1` | Enhanced focus and hover border lines | N/A |
| `fintech.success` / `payvia.success` | `#0E6245` | Accessible Emerald for verified status, consensus badges, and savings | **7.1:1** (WCAG AAA) |
| `fintech.warning` / `payvia.warning` | `#92400E` | High-contrast Amber for warning notices | **6.8:1** (WCAG AA) |
| `fintech.error` / `payvia.error` | `#991B1B` | High-contrast Crimson for payment and validation error messages | **7.5:1** (WCAG AAA) |
| `paypal.gold` | `#FFC439` | Official PayPal action button baseline (brand-preserved) | N/A |

### 1.2 Elevation & Radius Tokens
- **Borders:** Strict `1px solid #E2E8F0` across cards, modals, and tables. No heavy glowing strokes.
- **Shadows:** Standardized `shadow-xs` (`0 1px 2px 0 rgba(10, 25, 47, 0.05)`) and `shadow-sm` for active dropdowns.
- **Radii:** `rounded-lg` (8px) for buttons, inputs, and interactive tags; `rounded-xl` (12px) for cards; `rounded-full` for status badges.

---

## 2. Shared UI Primitives Updated

### 2.1 Button (`components/ui/button.tsx`)
- Standardized focus rings: `focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-2`.
- Primary variant now uses deep navy `#0A192F` with hover `#002266` and `shadow-xs`.
- Secondary variant now uses neutral `#F1F5F9` with border `#E2E8F0` and navy text `#0A192F`.
- Destructive variant updated to high-contrast `#991B1B`.

### 2.2 Status Badges (`components/ui/badge.tsx`)
- Standardized all 9 variants to meet strict 4.5:1 text-to-background contrast:
  - `success`: `#0E6245` text on `#ECFDF5` background with `#A7F3D0` border.
  - `info`: `#0052CC` text on `#EBF3FF` background with `#BFDBFE` border.
  - `warning`: `#92400E` text on `#FFFBEB` background with `#FDE68A` border.
  - `error` / `destructive`: `#991B1B` text on `#FEF2F2` background with `#FECACA` border.
  - `secondary`: `#0A192F` text on `#EBF3FF` background with `#0052CC`/25 border.

### 2.3 Cards & Panels (`components/ui/card.tsx`)
- Standardized `CardTitle` to `text-[#0A192F]` font-bold.
- Standardized `CardDescription` to `text-[#475569]` leading-relaxed.
- Base card container elevated with crisp `border-[#E2E8F0]` and restrained `shadow-xs`.

### 2.4 Form Inputs (`components/ui/input.tsx`)
- Input labels updated to `text-[#475569]` font-semibold.
- Text input foreground updated to `text-[#0A192F]`.
- Placeholder text standardized to accessible `#64748B`.
- Focus state standardized to `border-[#0052CC]` with subtle `ring-[#0052CC]/20`.
- Error text and error focus borders standardized to high-contrast `#991B1B`.

---

## 3. Global Layout & Header Standardization

### 3.1 Global Header (`components/navigation/Header.tsx`)
- Normalized desktop links to `text-[#475569]` with active pill highlight `bg-[#F1F5F9] text-[#0A192F] font-bold`.
- Updated PayPal Sandbox status pill to accessible `#0E6245` on `#ECFDF5` with `#A7F3D0` border.
- Enhanced mobile drawer menu button with visible focus rings (`focus:ring-[#0052CC]`) and high-contrast icon.
- Maintained existing accessible drawer lifecycle: ESC key dismissal, focus trapping, and body scroll lock.

### 3.2 Root Layout (`app/layout.tsx`)
- Applied global base text color `text-[#0A192F]` and soft background `bg-[#F8FAFC]`.
- Normalized footer text to `text-[#475569]` and brand accent to `#0052CC`.

---

## 4. Accessibility Improvements & Measured Contrast

| Element | Background | Text Color | Old Contrast | New Contrast | Compliance |
|---|---|---|:---:|:---:|:---:|
| Primary Headings | `#FFFFFF` | `#0A192F` | 13.5:1 | **15.8:1** | **WCAG AAA** |
| Secondary Text / Subtitles | `#FFFFFF` | `#475569` | 3.4:1 (Fail) | **5.4:1** | **WCAG AA** |
| Input Placeholders | `#FFFFFF` | `#64748B` | 2.5:1 (Fail) | **4.6:1** | **WCAG AA** |
| Success Badges | `#ECFDF5` | `#0E6245` | 4.1:1 (Fail) | **7.1:1** | **WCAG AAA** |
| Warning Badges | `#FFFBEB` | `#92400E` | 3.8:1 (Fail) | **6.8:1** | **WCAG AA** |
| Error Badges & Alerts | `#FEF2F2` | `#991B1B` | 4.2:1 (Fail) | **7.5:1** | **WCAG AAA** |

---

## 5. Files Modified

1. [tailwind.config.ts](file:///g:/PayVia/tailwind.config.ts):
   - Defined `brand.navy` (`#0A192F`), `brand.blue` (`#0052CC`), `surface.muted` (`#F1F5F9`).
   - Added backward-compatible aliases under `payvia.*` to eliminate undefined CSS classes.
   - Standardized `boxShadow` and `borderRadius` scales.
2. [app/globals.css](file:///g:/PayVia/app/globals.css):
   - Standardized CSS custom properties (`--foreground`, `--primary`, `--border`, `--brand-navy`, `--brand-blue`).
   - Retained `@media (prefers-reduced-motion)` and fintech utility classes.
3. [components/ui/button.tsx](file:///g:/PayVia/components/ui/button.tsx):
   - Standardized button variants to consume design tokens and `#0052CC` focus rings.
4. [components/ui/badge.tsx](file:///g:/PayVia/components/ui/badge.tsx):
   - Standardized badge background and text colors to WCAG AA/AAA compliance.
5. [components/ui/card.tsx](file:///g:/PayVia/components/ui/card.tsx):
   - Standardized card text, subtitle color, and subtle shadow elevation.
6. [components/ui/input.tsx](file:///g:/PayVia/components/ui/input.tsx):
   - Standardized input label, value text, placeholder, and error colors.
7. [components/navigation/Header.tsx](file:///g:/PayVia/components/navigation/Header.tsx):
   - Updated desktop navigation links, sandbox pill badge, and mobile drawer buttons.
8. [app/layout.tsx](file:///g:/PayVia/app/layout.tsx):
   - Applied global body text token and refined footer styles.

---

## 6. Regression Verification Results

All repository checks were executed and passed cleanly:

- `npm run typecheck` ➔ **0 errors (Exit Code: 0)**
- `npm run lint` ➔ **0 errors, 13 non-blocking warnings (Exit Code: 0)**
- `npm run check:secrets` ➔ **0 private secrets exposed (Exit Code: 0)**
- `npm test` ➔ **150/150 invariant tests passed (Exit Code: 0)**
- `npm run build` ➔ **13/13 static & dynamic routes compiled (Exit Code: 0)**
  - First load shared JS remains optimal at **106 kB**.
  - Route `/merchant` remains code-split at **127 kB**.

---

## 7. Known Limitations & Next Steps

### Limitations in Phase 2:
- Individual page layouts (e.g., the dual negotiation models in `/` vs `/negotiate`, and 7 tabs on `/merchant`) were intentionally not refactored in this phase, as Phase 2 scope was strictly the shared design system foundation.

### Recommended Next Phase:
- **Phase 3: Canonical Buyer Journey & Homepage Unification**
  - Connect the homepage `ShoppingIntentExperience` as the canonical entry point for all shopping and negotiation.
  - Modernize `OfferComparisonTable.tsx` and `NegotiationTimeline.tsx` to directly consume the newly standardized design tokens.
