# adriawebcode

Multilingual agency site (de/en/hr/bs/sr) with an automated instant-quote →
offer → acceptance e-mail pipeline. Live at https://adriawebcode.com (Vercel).

## Rules

ECC rule packs live in `.claude/rules/ecc/` (common, typescript, react, web).
Language-specific rules override common ones.

## Stack & Commands

- Next.js 15 App Router, TypeScript strict, Tailwind CSS
- `npm run build` — production build (must stay green)
- `npx tsc --noEmit` — type check
- `npx next start -p 3777` — serve the built app locally for verification
- Deploy: `npx vercel --prod --yes --token $VERCEL_TOKEN --scope team_2WxUcav3yKglOsK7sXvsADt4`
- Secrets live in `.env.local` (gitignored) and Vercel env — never commit them

## Architecture Landmarks

- `src/lib/quote.ts` — pricing engine. Net base prices per market
  (REGION_FACTOR), VAT per country (VAT_RATE), customer-facing gross uses
  charm pricing: `charm90` (ends …9,90) / `ceil100` for RSD. Net and VAT are
  derived from the gross so offer arithmetic is exact.
- `src/lib/pricing-display.ts` — advertised plan/maintenance prices per
  market + gross/net formatting for the static pricing surfaces.
- `src/lib/region.ts` — Firmensitz-based market detection: the company
  address in the form decides the price market, not the selected country.
- `src/lib/notify.ts` + `src/lib/email-template.ts` — Resend e-mails
  (offer, scheduled follow-up, acceptance) in the branded shell;
  per-locale senders (angebot@/offers@/ponuda@).
- `src/lib/accept-token.ts` — HMAC-signed one-click acceptance links.
- `src/i18n/dictionaries/*.ts` — all copy, five locales. Price mentions in
  meta/FAQ/maintenance options are gross and must match the pricing engine.
- `src/components/Hero.tsx` — specimen cost estimate priced by the real
  engine; content animates via pure CSS (never JS-gate content visibility).
  `HeroWaves.tsx` (canvas water background) and `CountUpPrice.tsx` are the
  only client-side flourishes.

## Design System — "Kalkweiß & Tiefsee"

kalk #F2F4F5 · paper #FFFFFF · ink #1A2126 · muted #46525A ·
tiefsee #0E4B5A / press #093642 · rule #C9D2D6. Logo chip navy #0B1F33 with
aqua #33C6DC — the aqua is reserved for the logo only. Flat surfaces: no
gradients, glows or shadows; radius 0 except buttons/inputs (6px).
Font: Archivo (sans), JetBrains Mono 700 only for the `<adriawebcode/>` logo.
Every animation needs a `prefers-reduced-motion` fallback.

## Verification

After UI changes: build, serve on :3777, screenshot 375px and 1440px with
playwright-core (`executablePath: /opt/pw-browsers/chromium-*/chrome-linux/chrome`),
check `document.documentElement.scrollWidth` for horizontal overflow.
After price changes: verify de + bs + sr pages so €, KM and RSD all match.
