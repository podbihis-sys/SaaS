# Plan: PrüfPilot MVP — Milestones 2–6

**Source PRD**: `pruefpilot/docs/PRD.md`
**Selected Milestone**: M2 „Kern-Inventar" (detailliert) · M3–M6 als Folgephasen
**Complexity**: Large (gesamt) · M2 allein: Medium
**Erstellt**: 2026-06-12 via `/ecc:plan`

## Summary

Eigenständiges Next.js-15-Projekt unter `pruefpilot/` (App Router, TypeScript strict, Tailwind) mit Supabase (Postgres + Auth + RLS + Storage, Region Frankfurt), Resend und Stripe auf Vercel. Das Datenmodell ist ab Migration 0001 mandantenfähig (`company_id` + RLS), auch wenn V1 nur einen Benutzer je Betrieb bedient (PRD Out-of-Scope). Implementierung streng in Milestone-Reihenfolge; nach jedem Milestone: Typecheck, Lint, Tests, Build grün.

## Patterns to Mirror (aus dem Eltern-Repo SaaS Handwerk)

| Category | Source | Pattern |
|---|---|---|
| Migrationen | `supabase/migrations/0001_init.sql`, `0002_rls.sql` | Nummerierte Dateien `NNNN_name.sql`; lowercase SQL |
| RLS | `supabase/migrations/0002_rls.sql:1-17` | `security definer`-Helper (stable, `set search_path = public`) + `revoke all` / `grant execute to authenticated` |
| Policy-Naming | `supabase/migrations/0002_rls.sql:32-35` | `<tabelle>_<aktion>` (z. B. `devices_select`) |
| Scripts | `web/package.json:5-11` | `dev/build/start/lint/typecheck`; Typecheck = `tsc --noEmit` |
| Auth/Client | `web/package.json:25-26` | `@supabase/ssr` ^0.5 + `@supabase/supabase-js` ^2 (Server/Client/Middleware-Split) |
| Formulare | `web/package.json:13,38,41` | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Tests (Web) | — | **Kein bestehendes Web-Test-Pattern im Eltern-Repo** → neu: Vitest für pure Logik (`lib/*.test.ts`); kein Pattern erfunden |

## Zielstruktur

```
pruefpilot/
  package.json  next.config.ts  tsconfig.json  postcss.config.mjs  vercel.json  .env.example  vitest.config.ts
  app/
    layout.tsx  page.tsx                      # Landing-Platzhalter (M1-Validierung verlinkt)
    (auth)/login/page.tsx  (auth)/register/page.tsx  auth/callback/route.ts
    (app)/layout.tsx                          # Auth-Guard + Shell (Nav, Trial-Banner ab M6)
    (app)/onboarding/page.tsx                 # Betrieb anlegen (Pflicht nach Registrierung)
    (app)/dashboard/page.tsx                  # Fälligkeits-Übersicht
    (app)/geraete/page.tsx  neu/page.tsx  [id]/page.tsx  [id]/bearbeiten/page.tsx
    (app)/geraete/[id]/pruefung/page.tsx      # M3: Prüfung erfassen
    (app)/geraete/[id]/etikett/page.tsx       # QR-Etikett druckbar
    api/cron/reminders/route.ts               # M4 (CRON_SECRET-geschützt)
    api/reports/audit/route.ts                # M5 (runtime='nodejs')
    api/stripe/checkout/route.ts  api/stripe/webhook/route.ts  api/stripe/portal/route.ts  # M6
  lib/
    supabase/server.ts  client.ts  middleware.ts
    due.ts  due.test.ts                       # Fälligkeitslogik (pur, getestet)
    categories.ts                             # Vorlagen-Konstanten (Spiegel der Seeds)
    reminders.ts  reminders.test.ts           # M4: Stage-Auswahl (pur, getestet)
    types.ts  zod-schemas.ts
  components/ui/…  components/devices/…
  supabase/migrations/0001_init.sql  0002_rls.sql  0003_inspections.sql (M3)  0004_reminders.sql (M4)  0005_billing.sql (M6)
  supabase/seed.sql                           # Kategorie-Vorlagen
  docs/                                       # (bereits vorhanden)
```

## Datenmodell (Migration 0001 + RLS in 0002)

Alle `date`-Spalten ISO `YYYY-MM-DD`; alle Zeitstempel `timestamptz` (UTC). IDs `uuid default gen_random_uuid()`.

- **companies**: `id`, `owner_id uuid not null unique → auth.users` (V1: genau 1 User je Betrieb), `name text not null`, `contact_email text not null` (Erinnerungen + Eskalation), `created_at`. — Vorbereitet für spätere memberships-Tabelle, ohne sie jetzt zu bauen.
- **device_categories** (global, read-only): `id text pk` (Slug), `name_de`, `legal_basis`, `default_interval_months int`, `sort`. Seeds:
  | id | name_de | legal_basis | default_interval_months |
  |---|---|---|---|
  | `dguv_v3_portable` | Elektrogerät (ortsveränderlich) | DGUV Vorschrift 3 / VDE 0701-0702 | 12 |
  | `dguv_v3_fixed` | Elektroanlage (ortsfest) | DGUV Vorschrift 3 / VDE 0105-100 | 48 |
  | `ladder` | Leiter / Tritt | DGUV Information 208-016 | 12 |
  | `fire_extinguisher` | Feuerlöscher | DIN 14406-4 / ASR A2.2 | 24 |
  | `first_aid` | Erste-Hilfe-Material | DGUV Vorschrift 1 / DIN 13157 | 12 |
  | `uvv_vehicle` | Fahrzeug (UVV) | DGUV Vorschrift 70 | 12 |
  | `uvv_forklift` | Flurförderzeug (UVV) | DGUV Vorschrift 68 | 12 |
  ⚠️ **Fachliche Defaults vom Founder zu verifizieren** (DGUV-V3-Intervalle sind risikoabhängig 6–24 Monate; UI zeigt „Empfehlung — bitte prüfen").
- **devices**: `id`, `company_id not null → companies on delete cascade`, `category_id → device_categories`, `name not null`, `location`, `serial_number`, `interval_months int not null` (aus Kategorie kopiert, editierbar), `next_due_date date not null`, `status text check in ('active','retired') default 'active'`, `public_code text unique` (kurzer Code fürs QR-Etikett), `notes`, `created_at`, `updated_at` (Trigger).
- **inspections** (M3, append-only): `id`, `device_id → devices cascade`, `company_id` (denormalisiert für RLS), `inspected_at date not null`, `inspector_name text not null`, `result text check in ('passed','passed_with_defects','failed')`, `comment`, `document_path text` (Storage-Pfad), `created_at`. **Keine UPDATE/DELETE-Policies → unveränderliche Historie.** DB-Trigger: bei `passed`/`passed_with_defects` → `devices.next_due_date = inspected_at + interval_months`.
- **reminder_log** (M4): `id`, `device_id`, `company_id`, `stage text check in ('d60','d30','d7','overdue')`, `due_date date not null` (Fälligkeit, für die erinnert wurde), `sent_at`. **`unique (device_id, stage, due_date)` = Idempotenz.**
- **Billing (M6, auf companies)**: `stripe_customer_id`, `stripe_subscription_id`, `subscription_status text default 'trialing'`, `trial_ends_at timestamptz default now() + interval '14 days'`.
- **RLS (0002)**: Helper `current_company_id()` (security definer, stable, `select id from companies where owner_id = auth.uid()`), revoke/grant wie Eltern-Repo. Policies je Tabelle `*_select/_insert/_update/_delete` mit `company_id = current_company_id()`; `companies`: `owner_id = auth.uid()`; `device_categories`: select für `authenticated`. Storage-Bucket `inspection-docs` privat, Pfadkonvention `{company_id}/{device_id}/{uuid}.pdf`, Policies analog.

## Files to Change — M2 (Kern-Inventar)

| File | Action | Why |
|---|---|---|
| `pruefpilot/package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.env.example`, `vitest.config.ts` | CREATE | Projekt-Scaffold, TS strict, Tailwind v4, Vitest |
| `pruefpilot/supabase/migrations/0001_init.sql`, `0002_rls.sql`, `seed.sql` | CREATE | Schema, RLS, Kategorie-Vorlagen |
| `pruefpilot/lib/supabase/{server,client,middleware}.ts`, `middleware.ts` | CREATE | @supabase/ssr-Pattern, Session-Refresh, Route-Schutz |
| `pruefpilot/lib/{due.ts,due.test.ts,categories.ts,types.ts,zod-schemas.ts}` | CREATE | Fälligkeitslogik (überfällig/≤30/≤60/ok) pur + getestet |
| `pruefpilot/app/(auth)/…`, `app/auth/callback/route.ts` | CREATE | Registrierung/Login (E-Mail+Passwort) |
| `pruefpilot/app/(app)/onboarding/page.tsx` | CREATE | Betrieb anlegen; Guard: ohne company → onboarding |
| `pruefpilot/app/(app)/geraete/…` (Liste/Neu/Detail/Bearbeiten) | CREATE | Geräte-CRUD; Kategorie-Select füllt Intervall vor; `next_due_date` aus „zuletzt geprüft am" + Intervall oder direkt |
| `pruefpilot/app/(app)/geraete/[id]/etikett/page.tsx` | CREATE | QR-Etikett (Lib `qrcode`), Print-CSS; Ziel-URL `/geraete/{id}` via `public_code`-Resolver |
| `pruefpilot/app/(app)/dashboard/page.tsx` | CREATE | Kacheln: überfällig / ≤30 / ≤60 / ok + Liste nächster Fälligkeiten |
| `pruefpilot/app/{layout,page}.tsx`, `app/(app)/layout.tsx`, `components/…` | CREATE | Shell, Nav, Landing-Platzhalter |

### Tasks M2
1. **Scaffold** — package.json (Scripts wie `web/package.json:5-11` + `test: vitest run`), Next 15/React 19, TS strict, Tailwind v4, Vitest. *Validate*: `pnpm typecheck && pnpm lint && pnpm build`.
2. **Migration 0001 + 0002 + Seed** — Schema/RLS wie oben, Stil wie `supabase/migrations/0002_rls.sql`. *Validate*: Apply gegen Wegwerf-Postgres (Docker `postgres:16`): `psql -f 0001 -f 0002 -f seed.sql` fehlerfrei; RLS-Smoke: anonyme Rolle sieht 0 Zeilen.
3. **Fälligkeitslogik `lib/due.ts`** — `dueStatus(nextDue: ISODate, today: ISODate) → 'overdue'|'due_30'|'due_60'|'ok'` + `nextDueFrom(lastInspected, intervalMonths)` (Monatsarithmetik, Monatsende-Klemmung). *Validate*: `pnpm test` (Tabellen-Tests inkl. 31.01.+1M → 28./29.02., Schaltjahr, heute=Stichtag).
4. **Auth + Onboarding** — @supabase/ssr Server/Client/Middleware; Register→Callback→Onboarding(company insert)→Dashboard. *Validate*: `pnpm build`; manueller Smoke gegen Supabase-Testprojekt (dokumentiert in README).
5. **Geräte-CRUD** — Server Components + Server Actions, Zod-Validierung, RHF-Formulare; `public_code` = 8-stelliger Base32-Code. *Validate*: `pnpm test && pnpm build`; Smoke: Gerät anlegen → Liste zeigt Status-Badge.
6. **Dashboard + QR-Etikett** — Aggregation über `devices` mit `dueStatus`; Etikett-Seite mit `@media print`. *Validate*: `pnpm build`; Smoke: Code scannen → Geräteseite.

## M3 — Prüfdokumentation (Phase)
0003-Migration (inspections + Trigger `set_next_due_after_inspection` + Storage-Bucket/Policies) · Formular „Prüfung erfassen" (Datum/Prüfer/Ergebnis/Bemerkung/PDF-Upload via signierte URL) · Historie auf Gerätedetail (append-only, neueste zuerst) · Badge „Mängel"/„durchgefallen" am Gerät. *Validate*: Trigger-Test in SQL (insert passed → next_due springt), `pnpm test`, Upload-Smoke.

## M4 — Erinnerungs-Engine (Phase)
0004-Migration (reminder_log) · `lib/reminders.ts`: pure Stage-Auswahl — `d60` wenn `0 ≤ daysLeft ≤ 60` und kein d60-Log für diese `due_date`, analog d30/d7; `overdue` wenn `daysLeft < 0` (Eskalationstext) — **fensterbasiert**, damit ausgefallene Cron-Tage nichts überspringen · `app/api/cron/reminders/route.ts`: `Authorization: Bearer ${CRON_SECRET}`-Guard, Service-Role-Client (RLS-Bypass dokumentiert), Resend-Versand, Insert in `reminder_log` (on conflict do nothing) · `vercel.json` Cron täglich 05:00 UTC. *Validate*: `pnpm test` (Stage-Matrix inkl. Idempotenz-Doppellauf), Dry-Run-Modus `?dryRun=1` listet statt sendet.

## M5 — Audit-Export (Phase)
`app/api/reports/audit/route.ts` mit `export const runtime = 'nodejs'`, `@react-pdf/renderer` (kein Puppeteer — Vercel-tauglich) · Inhalt: Deckblatt (Betrieb, Stichtag), je Kategorie Tabellen (Gerät, Standort, Intervall, letzte Prüfung, Ergebnis, nächste Fälligkeit, Status), Anhang Nachweisliste (Dokument-Pfade) · Wording „lückenlos dokumentiert", **nicht** „revisionssicher" (PRD) · Button im Dashboard. *Validate*: Route liefert `application/pdf` > 0 Bytes mit Seed-Daten; Build grün.

## M6 — Monetarisierung (Phase)
0005-Migration (Billing-Spalten) · Checkout-Route (Stripe Checkout Session, `STRIPE_PRICE_ID` = 49 €/M netto, `customer_email` vorbefüllt) · Webhook-Route (Signatur-Verifikation; `checkout.session.completed`, `customer.subscription.updated|deleted` → Status-Sync) · Portal-Route · Guard im `(app)/layout`: `trialing` bis `trial_ends_at`, danach nur `active/past_due(grace)`; sonst Paywall-Seite · Trial-Banner mit Resttagen. *Validate*: `stripe listen`-Smoke dokumentiert; Unit-Test Status-Mapping; Build grün.

## Validation (gesamt, nach jedem Milestone)
```bash
cd pruefpilot
pnpm typecheck && pnpm lint && pnpm test && pnpm build
# Migrationen (Wegwerf-DB):
docker run -d --rm -e POSTGRES_PASSWORD=pw -p 55432:5432 postgres:16
psql postgresql://postgres:pw@localhost:55432/postgres -f supabase/migrations/0001_init.sql \
  -f supabase/migrations/0002_rls.sql -f supabase/seed.sql
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| `@supabase/ssr`-API-Drift (Next 15) | mittel | Versionen wie Eltern-Repo pinnen (`web/package.json:25-26`); Middleware-Pattern aus offizieller Doku |
| RLS-Rekursion/Fehler im Helper | mittel | `current_company_id()` security definer + stable (Muster `0002_rls.sql:1-17`); negativer RLS-Smoke-Test |
| Monatsarithmetik Fälligkeit (31.→Feb.) | mittel | Pure Funktion + Tabellen-Tests (Task 3) statt Inline-Datumsrechnung |
| Cron-Doppelversand/Lücken | mittel | `unique(device_id, stage, due_date)` + fensterbasierte Stages + Dry-Run |
| PDF-Rendering auf Vercel | niedrig | `@react-pdf/renderer` (pure JS) + `runtime='nodejs'`, kein Puppeteer |
| Stripe-Webhook lokal | niedrig | `stripe listen`-Anleitung in README; Signatur-Secret aus env |
| **Fachliche Prüfintervalle falsch** | mittel | Defaults markiert „Empfehlung — bitte prüfen"; Founder-Review vor Design-Partner-Launch (offene PRD-Frage) |
| Kein Live-Supabase in dieser Umgebung | hoch | SQL gegen Docker-Postgres validieren; Auth-/Storage-Smoke dokumentiert als manuelle Checkliste |

## Effort (für den Solo-Founder, mit Claude Code)
M2 ≈ 25–35 h · M3 ≈ 10–15 h · M4 ≈ 8–12 h · M5 ≈ 6–10 h · M6 ≈ 10–15 h → **≈ 60–90 h** gesamt (konsistent mit Council: „halbierter MVP").

## Acceptance
- [ ] Alle M2-Tasks abgeschlossen, Validation grün
- [ ] RLS-Negativtest: fremde `company_id` liefert 0 Zeilen
- [ ] Patterns gespiegelt (Migrations-/Policy-Stil, Scripts), nicht neu erfunden
- [ ] PRD-Milestone-Status nach Abschluss auf `complete`
