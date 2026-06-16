# BFSG-Monitor

Self-service B2B SaaS for the DACH market: a customer enters their domain → an
automated accessibility scan (**WCAG 2.1 AA** via axe-core) → a German report
with a prioritised fix list, an accessibility-statement generator, and ongoing
monitoring with email alerts and a PDF evidence document.

> **Staging note:** This directory is the staging copy inside the `SaaS` repo.
> The canonical repository is **https://github.com/podbihis-sys/bfsg-monitor**;
> migrate this folder there once push access from the build environment exists.

## Guardrails (non-negotiable)

1. Never claim "rechtssicher", "100 % konform", or "abmahnsicher". Position as
   **monitoring / early-warning / diagnosis**.
2. **No overlay, no auto-fix widget.** We scan, report, and monitor — we never
   manipulate the customer's site.
3. Automated tests find only ~30–40 % of WCAG issues — every report says so.
4. A **"keine Rechtsberatung"** disclaimer is always visible.
5. **GDPR:** only scan publicly reachable pages; store no visitor PII; minimal
   data retention.

These are encoded in [`src/lib/constants.ts`](src/lib/constants.ts)
(`DISCLAIMERS`, `WCAG`, `LAW`) — change them in one place, never inline.

## Tech stack

| Layer | Tech |
|---|---|
| Web / SSR | Next.js 16 (App Router, TS), Tailwind v4, shadcn/ui |
| Hosting | Vercel |
| Auth + DB + Storage | Supabase (Postgres, Auth, RLS) |
| Payments | Stripe (Checkout + Customer Portal + Webhooks) |
| Scan worker | separate Node service (Express + Playwright + @axe-core/playwright) on Railway |
| Queue | Postgres `scan_jobs` + Vercel Cron |
| Email | Resend |
| Analytics | Plausible |

UI/content language: **German only** (MVP).

## Project structure

```
src/
  app/            Next.js App Router (marketing, /check funnel, /app dashboard, /api)
  components/ui/  shadcn/ui components
  lib/
    constants.ts     standard, legal facts, disclaimers, plans, limits (capsulated)
    entitlements.ts  central plan-gating resolver (getEntitlements)
supabase/
  migrations/     SQL schema + RLS + storage bucket
```

## Setup

```bash
cp .env.example .env.local   # fill in Supabase, Stripe, Resend, worker secrets
npm install
npm run dev                  # http://localhost:3000
```

Apply the database schema with the Supabase CLI:

```bash
supabase db push             # applies supabase/migrations/*.sql
```

## Environment variables

See [`.env.example`](.env.example). The `SUPABASE_SERVICE_ROLE_KEY`,
`STRIPE_*`, `SCAN_WORKER_SECRET`, and `CRON_SECRET` values are server-only and
must never reach the browser.

## Build phases

- [x] **Phase 0 — Setup:** Next.js + Tailwind + shadcn/ui scaffold, Supabase
      migrations (all tables + RLS + `reports` storage bucket), `.env.example`,
      capsulated standard/disclaimer/plan constants.
- [ ] Phase 1 — Auth & app shell
- [ ] Phase 2 — Scan worker (separate repo/service)
- [ ] Phase 3 — Free-scan funnel (`/check`)
- [ ] Phase 4 — Billing (Stripe)
- [ ] Phase 5 — Full scan & reports
- [ ] Phase 6 — Monitoring & alerts
- [ ] Phase 7 — Accessibility-statement generator
- [ ] Phase 8 — SEO & content
- [ ] Phase 9 — Legal & launch

This is a monitoring/diagnostic tool, **not legal advice**.
