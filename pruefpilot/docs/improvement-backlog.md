# PrüfPilot — Verbesserungs-Backlog & Session-Handoff

*Stand: 2026-06-15 · dient zugleich als /ecc:plan-Ergebnis „was noch verbessern" und als Wiederaufnahme-Notiz nach /compact.*

## Aktueller Stand (überlebt Kompaktierung)
- MVP M2–M6 fertig: Auth, Onboarding, Geräteinventar (7 Prüfkategorien), Prüfdoku (append-only + Trigger), Erinnerungs-Cron, Audit-PDF, Stripe (49 €, 14-Tage-Trial), Leads/Landing.
- UI modern überarbeitet: Landing (Bento/Glas), Dashboard (Donut), Geräte (Karten), Detail (Hero+Timeline), Auth-Shell, einstellbare Sidebar.
- Live: https://pruefpilot-sable.vercel.app · Supabase eu-central-1 (Projekt `otsavbpvfzkytlouklwe`).
- Testzugang: test@pruefpilot.app / PruefPilot-Test-2026!
- ECC dauerhaft als Plugin aktiv (.claude/settings.json + autoUpdate; CLAUDE.md vorhanden).
- Branch: claude/stoic-maxwell-5ya01f → wird nach main gemergt; Auto-Deploy via .github/workflows/deploy-pruefpilot.yml.
- ⚠️ Vercel-Token steht im Chatverlauf → vom Nutzer rotieren; /tmp-Kopie bis „löschen" behalten.

## P0 — Produkt funktional scharf schalten (Secrets fehlen)
1. **E-Mail-Erinnerungen aktivieren:** `RESEND_API_KEY` + verifizierte Domain, `CRON_SECRET`, `REMINDER_FROM` als Vercel-Env/GitHub-Secret. Cron testen (`/api/cron/reminders?dryRun=1`). Ohne diese laufen 60/30/7-Mails nicht.
2. **Stripe scharfschalten:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` (49 € Produkt anlegen). `stripe listen`-Smoke; Checkout→Webhook→subscription_status prüfen.
3. **End-to-End-Smoke gegen Live-Supabase:** echte Registrierung+Bestätigungsmail, PDF-Upload, Audit-Export, Checkout. Lief lokal grün, aber nie komplett gegen echte Dienste.

## P1 — Launch-Blocker
4. **Rechtstexte** final (Impressum/Datenschutz/AGB sind Platzhalter mit noindex) — eRecht24/Anwalt; inkl. AGB-Haftungsklausel Erinnerungsfunktion + Intervall-Unverbindlichkeit (Council-Findings).
5. **DSGVO-Betroffenenrechte:** Datenexport + Kontolöschung im Account (aktuell nicht vorhanden).
6. **CI für pruefpilot:** Workflow (typecheck/lint/test/build) auf PRs — aktuell nur Deploy, kein PR-Gate; Regressionen werden nicht automatisch gefangen.
7. **Validierung (Business, kein Code):** ≥5 Vorbestellungen über Landing-Formular; Nebentätigkeitsgenehmigung. PRD-Milestone 1 = Launch-Gate.

## P2 — Härtung & Qualität
8. **Security-Header/CSP** (next.config headers), **Rate-Limiting** für `/api` (Lead-Insert, Auth, Cron) + Honeypot ist da, ggf. Turnstile.
9. **Observability:** Fehler-Monitoring (Sentry), strukturierte Logs in Cron/Webhook, Alerting bei Reminder-Fehlern; Funnel-Analytics (Plausible, cookieless).
10. **Tests vertiefen:** Integrations-/E2E (Playwright) für Auth→Onboarding→Gerät→Prüfung→Export; RLS-Negativtests in CI; a11y-Checks (Kontrast/Fokus/Landmarks).
11. **QR-öffentliche Ansicht** für externe Prüfer entscheiden (aktuell Login-Pflicht; PRD offene Frage).
12. **Geräte-Liste skaliert:** Such-/Sortier-/Paginierung (lädt aktuell alle Geräte).
13. **Formular-Feinschliff** (pausiert): Gerät anlegen/bearbeiten, Prüfung erfassen — Seitenkopf/Back-Link/Bento wie Detailseite.

## P3 — Wachstum (Council: nach PMF)
14. **Dienstleister-Tarif** (mandantenfähig) — laut Council+Markt der stärkste Hebel; B2B2B-Kanal.
15. Mehrbenutzer/Rollen, Mehrstandort, CSV-Import, Foto-Upload, Mobile-App (Expo), Unterweisungs-Modul.
16. **SEO:** per-Page-Metadata, Sitemap, robots, OG-Images, Blog/Lead-Magnete (Marketing-Paket in docs/marketing/).

## Repo-weit (nicht nur pruefpilot)
- `web/` & `backend/` (Craftsman-MVP): Strategie klären, ob pruefpilot separat bleibt; `deploy-backend.yml` war zuletzt rot.
- `web/` nutzte verwundbares Next 15.1.3 → bereits auf 15.5.19 gehoben (erledigt).

## Empfohlene Reihenfolge
P0 (funktioniert es echt?) → P1 (darf es live?) → Validierung → P2 → P3.

## Nach /compact hier weitermachen
Diese Datei lesen, dann mit dem Nutzer die nächste P-Stufe wählen. Code-Änderungen weiterhin: typecheck/lint/build grün, dann committen/pushen, PR, mergen (Auto-Deploy).
