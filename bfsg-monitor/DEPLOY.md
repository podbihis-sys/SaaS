# BFSG-Monitor — Deployment & Launch Guide

Two services:

- **`bfsg-monitor/`** — Next.js 16 web app → **Vercel**
- **`bfsg-monitor-worker/`** — Express + Playwright scan service → **Railway**

> The code currently lives under these directories in `podbihis-sys/saas`
> (branch `claude/bfsg-monitor`). The canonical repo is
> **https://github.com/podbihis-sys/bfsg-monitor**. You can either migrate the
> two folders there, or deploy straight from the monorepo using the **Root
> Directory** setting (no migration needed) — see below.

---

## 0. Prerequisites

Accounts: Vercel, Railway, Supabase (already provisioned), Stripe, Resend,
Plausible (optional analytics).

---

## 1. Supabase (already live)

Project **bfsg-monitor**, region `eu-central-1`.

- **API URL:** `https://axmhivybpkcgmulyilrc.supabase.co`
- **Publishable (anon) key:** `sb_publishable_OkUySuNXydZP5a6NOEL1jA_xj6RpVO8`
- **Service-role key:** Dashboard → Project Settings → API → `service_role`
  (server-only secret — never expose to the browser).

Configure **Authentication → URL Configuration**:

- **Site URL:** your Vercel URL (e.g. `https://bfsg-monitor.vercel.app`)
- **Redirect URLs:** add `https://<your-app>/auth/callback`

Enable **Google** provider (Authentication → Providers) with a Google OAuth
client; without it only the magic-link login works.

Schema is already applied (migrations `0001`–`0003`). For a fresh project,
apply `supabase/migrations/*.sql` via `supabase db push`.

---

## 2. Deploy the web app to Vercel

1. **Add New → Project → Import** `podbihis-sys/saas`.
2. Branch `claude/bfsg-monitor`; **Root Directory = `bfsg-monitor`** (framework
   auto-detected as Next.js).
3. Add environment variables (see the reference table below).
4. **Deploy.** Then set `NEXT_PUBLIC_APP_URL` to the resulting URL and redeploy.

`vercel.json` already declares the daily monitoring cron
(`/api/cron/monitor`). Set `CRON_SECRET` in Vercel so cron requests are
authorized.

---

## 3. Deploy the scan worker to Railway

1. **New Project → Deploy from GitHub repo** `podbihis-sys/saas`.
2. **Root Directory = `bfsg-monitor-worker`** (builds the `Dockerfile` on the
   official Playwright image — Chromium included).
3. Set `SCAN_WORKER_SECRET` (any strong random string). Railway injects `PORT`.
4. Copy the public URL → set it as `SCAN_WORKER_URL` in Vercel, and use the
   same secret for `SCAN_WORKER_SECRET` in Vercel.

Smoke test: `GET https://<worker>/health` → `{"ok":true}`.

---

## 4. Stripe

1. Create two products — **Starter** and **Pro** — each with a **monthly** and
   **yearly** price. Match the display amounts in `src/lib/billing.ts`
   (Starter 29 €/290 €, Pro 99 €/990 €) or adjust both sides.
2. Put the four Price IDs into `STRIPE_PRICE_*` env vars.
3. Add a webhook endpoint → `https://<your-app>/api/stripe/webhook`, events:
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`. Copy the
   signing secret into `STRIPE_WEBHOOK_SECRET`.

---

## 5. Resend (email alerts)

Verify your sending domain, then set `RESEND_API_KEY` and `RESEND_FROM`
(e.g. `BFSG-Monitor <noreply@your-domain.de>`). Without `RESEND_FROM` the
Resend test sender is used (fine for testing only).

---

## 6. Analytics & legal

- **Plausible:** add your domain; the site is cookieless by design.
- **Legal:** complete and lawyer-review `/impressum`, `/datenschutz`, `/agb`
  (currently templates with placeholders).

---

## Environment variable reference

| Variable | Service | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Vercel | Public site URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Server-only; bypasses RLS |
| `STRIPE_SECRET_KEY` | Vercel | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Vercel | From the webhook endpoint |
| `STRIPE_PRICE_STARTER_MONTHLY/YEARLY` | Vercel | Price IDs |
| `STRIPE_PRICE_PRO_MONTHLY/YEARLY` | Vercel | Price IDs |
| `RESEND_API_KEY` / `RESEND_FROM` | Vercel | Email |
| `SCAN_WORKER_URL` / `SCAN_WORKER_SECRET` | Vercel | Worker endpoint + shared secret |
| `CRON_SECRET` | Vercel | Authorizes `/api/cron/*` |
| `SCAN_WORKER_SECRET` | Railway | Must match Vercel |

---

## Post-deploy checklist

- [ ] Visit `/` — landing renders, links work.
- [ ] Sign up (magic link) → `/app` loads; a `profiles` row is created.
- [ ] Worker `/health` is green; add a domain → "Scan starten" returns a score.
- [ ] `/check` runs a free scan and shows a result.
- [ ] Stripe Checkout completes (test mode) → plan reflected in `/app/billing`.
- [ ] Trigger `/api/cron/monitor` (with `Authorization: Bearer $CRON_SECRET`).
- [ ] PDF report downloads on a paid plan.

This is a monitoring/diagnostic tool, **not legal advice**. Automated tests
catch only ~30–40 % of WCAG issues — communicate this and keep manual review in
the loop.
