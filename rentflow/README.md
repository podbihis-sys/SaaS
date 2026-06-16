# RentFlow

Self-service B2B-SaaS für **Verleih-Betriebe** (DACH, MVP-Nische: Eventausstattung).
Ein Betrieb verwaltet sein Inventar, bekommt eine öffentliche Buchungsseite mit
**Live-Verfügbarkeit** und nimmt **Anzahlung/Kaution per Stripe direkt auf sein
eigenes Konto** entgegen. Doppelbuchungen sind **technisch ausgeschlossen**.

> Hinweis: RentFlow liegt als eigenständige Next.js-App im Unterordner `rentflow/`
> dieses Repos. Es teilt sich keinen Code mit dem übrigen Repo-Inhalt.

## Stack (fix)

| Schicht | Technologie |
|---|---|
| Frontend/SSR | Next.js 15 (App Router, TypeScript), Tailwind, shadcn-Konventionen |
| Auth + DB | Supabase (Postgres, Auth, RLS, Storage) |
| Payments | Stripe Connect (Standard, **Direct Charges**) für Mieter-Zahlungen + Stripe Subscriptions für das Plattform-Abo |
| E-Mail | Resend (transaktional) |
| Cron | Vercel Cron |
| PDF | `@react-pdf/renderer` (serverlos) — *geplant* |
| Analytics | Plausible (cookielos) |

Sprache: **Deutsch**. Zeitzone: **Europe/Berlin**. Granularität: **tagesbasiert**, Start–Ende inklusiv.

## Die beiden Geldströme (Guardrail #1)

- **Plattform-Abo:** normales Stripe-Abo, der Betrieb ist Kunde der Plattform → läuft auf dem Plattform-Account.
- **Mieter-Zahlung:** Stripe **Direct Charge** auf dem **verbundenen Konto** des Betriebs (`{ stripeAccount }`-Header). Das Geld landet beim Betrieb; die Plattform ist **niemals** im Geldfluss und zahlt nichts aus. `PLATFORM_FEE_BPS` (Default 0) erlaubt optional eine Application Fee.

## Doppelbuchungs-Schutz (Guardrail #2 — Kern-Invariante)

Zwei Sicherungen, definiert in `supabase/migrations/`:

1. **Transaktionale Buchungsanlage** — die Postgres-Funktion `create_booking_hold()`
   (`0003_booking_engine.sql`) sperrt die Item-Zeile (`SELECT … FOR UPDATE`), zählt
   überlappende Buchungen + aktive Holds + Sperren **innerhalb der Transaktion** neu und
   legt erst dann einen `pending`-Hold mit TTL an. Concurrent-Versuche für dasselbe Item
   serialisieren an der Sperre → genau einer gewinnt. Gilt für **jede** Menge (`quantity ≥ 1`).
2. **DB-EXCLUDE-Constraint** `no_overlap_qty1` (`0001_init.sql`) — für echte Einzelstücke
   (`is_unique`, abgeleitet aus `items.quantity = 1`) verbietet Postgres physisch zwei
   überlappende `confirmed`/`active`-Buchungen. Zweite Verteidigungslinie, selbst bei
   App-Logik-Fehlern.

## Projektstruktur

```
rentflow/
  supabase/migrations/
    0001_init.sql           Schema, btree_gist, EXCLUDE-Constraint, Signup-Trigger
    0002_rls.sql            RLS-Policies (Mandanten-Isolation)
    0003_booking_engine.sql create_booking_hold / check_availability / expire_holds
    0004_storage.sql        Buckets item-images & documents (privat)
  src/
    app/
      page.tsx              Marketing-Landing
      b/[slug]/page.tsx     Öffentliche Buchungsseite (Powered-by-Loop)
      api/
        booking/availability  Verfügbarkeit prüfen
        booking/create         transaktionaler Hold + Connect-Checkout
        booking/[id]/action    confirm / returned (Kaution-Erstattung) / cancel
        connect/onboard[/refresh]  Connect-Standard-Onboarding
        connect/webhook        account.updated + Zahlungsbestätigung (idempotent)
        checkout / portal      Plattform-Abo + Customer Portal
        stripe/webhook         Subscription-Events (idempotent)
        cron/expire-holds      abgelaufene Holds freigeben
        cron/reminders         Abhol-/Rückgabe-/Überfällig-Erinnerungen
    lib/
      booking/pricing.ts     calcRentalPrice() (pure, unit-getestet)
      booking/engine.ts       RPC-Wrapper inkl. Fehler-Mapping
      entitlements.ts         getEntitlements() / shouldShowBranding()
      stripe/                 Client, Plan-Mapping, Webhook-Idempotenz
      supabase/               server / client / service Clients
      email/send.ts           Resend-Templates
```

## Setup

```bash
cd rentflow
cp .env.example .env.local      # Werte eintragen (siehe unten)
npm install
npm run dev                     # http://localhost:3000
```

Datenbank: Supabase-Projekt anlegen, dann die Migrationen aus `supabase/migrations/`
in Reihenfolge ausführen (Supabase CLI `supabase db push` oder SQL-Editor).

ENV-Variablen sind in `.env.example` dokumentiert (Supabase, Stripe inkl. Connect-
Webhook-Secret, Stripe-Price-IDs für Solo/Pro monatlich/jährlich, Resend, `CRON_SECRET`).

### Stripe-Webhooks (lokal)

```bash
# Plattform-Abo-Events
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Connect-Events (verbundene Konten)
stripe listen --forward-connect-to localhost:3000/api/connect/webhook
```

## Tests & Checks

```bash
npm test          # Vitest (pricing + entitlements)
npm run typecheck  # tsc --noEmit
npm run build      # next build
```

## Build-Status (gegen Prompt-Phasen)

| Phase | Status |
|---|---|
| 0 Setup (Next.js, Migrationen, Storage) | ✅ |
| 3 Connect-Onboarding (Account + Link, `account.updated`) | ✅ Backend |
| 4 Verfügbarkeit & Buchungs-Engine (pricing-Tests, transaktional, expire-holds) | ✅ |
| 5 Öffentliche Buchungsseite + Direct-Charge-Checkout + Connect-Webhook | ✅ |
| 6 Owner-Aktionen (confirm/returned+Kaution-Refund/cancel) | ✅ API |
| 7 Plattform-Billing (Checkout, Portal, Webhook, Entitlements) | ✅ |
| 8 E-Mail & Reminder-Cron | ✅ |
| 1 Auth & App-Shell, 2 Inventar-UI, 6 Kalender-UI | ⏳ offen (UI) |
| 9 PDF (Bestätigung + Mietvertrag) | ⏳ offen |
| 10 SEO/Programmatic Content | ⏳ offen (Landing vorhanden) |
| 11 Recht (Impressum/DSGVO/AGB), Plausible, Sentry, E2E | ⏳ offen |

## Offene Punkte / bewusste Defaults

- **Auth-, Inventar- und Dashboard-UI** (Phasen 1/2/6) sind als API/Engine vorhanden,
  die eingeloggten Owner-Seiten folgen als nächster Schritt.
- **Concurrency-Test** (zwei parallele Buchungen, `quantity = 1`): die Invariante liegt
  in der DB (`FOR UPDATE` + EXCLUDE). Ein automatisierter Parallel-Request-Test gehört auf
  eine echte Postgres-Instanz und ist als Akzeptanzkriterium dokumentiert, aber noch nicht
  als CI-Test umgesetzt.
- **Kautions-Mechanik:** Default ist Erhebung als Zahlung + automatische Erstattung bei
  `returned` (funktioniert für beliebig lange Mieten). Die optionale manuelle Capture-
  Autorisierung (Hold ≤ 7 Tage) ist vorbereitet, aber nicht aktiviert.
- Vertrags-/PDF-Texte erhalten den Disclaimer **„Muster ohne Gewähr, keine Rechtsberatung."**
```
