# PrüfPilot

SaaS für gesetzlich vorgeschriebene Prüftermine in deutschen KMU (DGUV V3, Leitern, Feuerlöscher, Erste Hilfe, UVV, Unterweisungen): Geräteinventar mit QR-Codes, automatische Fristen-Erinnerungen, lückenlose Prüfdokumentation, Audit-PDF-Export.

> **Status:** Strategiephase. Noch kein Produktionscode — zuerst Validierung (siehe PRD, Milestone 1).
> Erarbeitet mit dem ECC-Plugin (Council, Market-Research, PRD, Marketing).

## Dokumente

| Dokument | Inhalt |
|---|---|
| [docs/businessplan.md](./docs/businessplan.md) | Ursprünglicher Businessplan (Quelle: Founder) |
| [docs/council-review.md](./docs/council-review.md) | Kritisches Go/No-Go-Review (4 Stimmen) — Annahmen, Schwachstellen, Scope-Korrektur |
| [docs/market-research.md](./docs/market-research.md) | Wettbewerbs- & Preisrecherche DACH (15 Anbieter, 35+ Quellen) |
| [docs/PRD.md](./docs/PRD.md) | Verbindliche MVP-Requirements (council-/research-korrigiert) |
| [docs/marketing/launch-package.md](./docs/marketing/launch-package.md) | Positionierung, Landingpage-Copy, E-Mail-Sequenz, SEO-Plan, Google Ads, Partnerprogramm, Launch-Checkliste |

## Kernentscheidungen aus dem Review

- **MVP halbiert:** Inventar + Fälligkeiten + Erinnerungen + Prüfdoku + Audit-PDF + Stripe (eine Stufe 49 €). Raus aus V1: Mehrbenutzer-UI, Mehrstandort, CSV-Import, Foto-Upload, Mandantenfähigkeit.
- **Validierung zuerst:** ≥5 verbindliche Vorbestellungen oder 1 Prüfdienstleister-LOI vor dem Launch.
- **Prüfdienstleister/Sifa** als wichtigster Kanal (gleichzeitig Gratis-Hauptwettbewerber des Use Case).
- **„revisionssicher" → „lückenlos dokumentiert"** (Haftung). Nebentätigkeitsgenehmigung vor Stunde 1.
- **20.000 €/Jahr ist ein 18–24-Monats-Ziel** (Conversion-Annahmen des Businessplans 2–3× zu optimistisch).

## Geplanter Stack

Next.js (App Router) · Supabase (Postgres/Auth/RLS, Region Frankfurt) · Stripe Billing · Resend · Vercel.

## Nächster Schritt

`/ecc:plan ./docs/PRD.md` → Implementierungsplan für Milestone 2 (Kern-Inventar).
