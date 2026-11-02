# PayVia UI Redesign Plan

## Brand Identity & Design System
- **Primary Brand (Sky Blue)**: `#38BDF8`
- **Primary Hover (Blue)**: `#0EA5E9`
- **Strong Actions (Deep Blue)**: `#0284C7`
- **Main Text (Deep Navy)**: `#0B1B33`
- **Secondary Text (Slate)**: `#52607A`
- **Muted Text / Placeholder**: `#94A3B8`
- **Main Background**: `#FFFFFF`
- **Subtle Background (Ice Blue)**: `#F0F9FF`
- **Borders & Dividers (Light Slate)**: `#DCE4EE`
- **Accent (Hot Pink - 3-5% touch)**: `#EC4899` (hover `#DB2777`, subtle tint `#FDF2F8`, ring `#F472B6`)
- **Success (Green)**: `#059669` / `#ECFDF5`
- **Warning (Amber)**: `#D97706` / `#FFFBEB`
- **Error (Red)**: `#DC2626` / `#FEF2F2`
- **Typography**: Manrope font with sans-serif fallback

## Component Checklist
1. **Logo Component** (`components/ui/Logo.tsx`):
   - Vivid blue / sky-blue rounded square icon with white lightning bolt SVG glyph.
   - Wordmark: "Pay" in Deep Navy (`#0B1B33`), "Via" in Sky Blue (`#38BDF8` or `#0284C7` for accessibility/contrast).
   - Reusable across Desktop Header, Mobile Drawer, Footer, and checkout screens.
2. **Design Tokens & Theme**:
   - Update `app/globals.css` with CSS variables & Manrope font import.
   - Update `tailwind.config.ts` with brand tokens (`brand.sky`, `brand.deep`, `brand.pink`, `surface.ice`, etc.).
   - Update shared UI components (`Button`, `Card`, `Badge`, `Input`, `Toast`).
3. **Navigation & Shell**:
   - `components/navigation/Header.tsx`: Clean white header, Sky Blue highlights, Hot Pink subtle status/badge dot or accent.
   - `app/layout.tsx`: Manrope font, crisp header and footer with new Logo.
4. **Buyer Journey**:
   - `app/page.tsx`: Updated headline (*"Better deals start with a conversation."*), clean 4-step workflow, high contrast, subtle ice blue surfaces, hot pink accent badge.
   - `components/buyer/ShoppingIntentExperience.tsx`: Streamlined form, progressive disclosure, clean inputs.
   - `app/negotiate/page.tsx` & `components/buyer/OfferComparisonTable.tsx`: Sky blue highlights for accepted offers, hot pink "Best Offer / Match" tag.
   - `app/agreement/page.tsx` & `components/AgreementCard.tsx`: SHA-256 seal, cryptographic verification badge, explicit buyer approval gate.
   - `app/checkout/page.tsx` & `components/PayPalCheckout.tsx`: Clean fintech summary, PayPal button container, error/pending states.
   - `app/checkout/success/page.tsx`: Verified receipt, green success state, clear order summary.
5. **Merchant & Fulfillment**:
   - `app/merchant/page.tsx` & subcomponents: Modern fintech workspace, tabbed control plane, policy editor, inventory table.
   - `app/fulfillment/page.tsx`: Clean milestone stepper, Bryntum toggle.
   - `app/memory/page.tsx`: AI memory exploration with clear non-authoritative boundary disclaimer.
6. **Verification & Tests**:
   - Run `npm run typecheck`.
   - Run `npm test`.
   - Test responsive layout and verify server runs without errors.

