# PrüfPilot MVP — Product Requirements Document

*PRD erstellt: 2026-06-12 · Quellen: [Businessplan](./businessplan.md) · [Council-Review](./council-review.md) · [Marktrecherche](./market-research.md)*

## Problem

Verantwortliche in deutschen KMU (5–50 Mitarbeiter) müssen gesetzlich vorgeschriebene Prüfungen (DGUV V3, Leitern & Tritte, Feuerlöscher, Erste-Hilfe-Material, UVV Fahrzeuge/Flurförderzeuge) fristgerecht durchführen **und nachweisen** können — verwalten sie aber in Excel, Aktenordnern oder gar nicht. Kosten des ungelösten Problems: verpasste Fristen, fehlende Nachweise bei Berufsgenossenschafts-Audits und nach Arbeitsunfällen, persönliche Haftung der Geschäftsführung (ArbSchG §13, DGUV Vorschrift 1, BetrSichV), Bußgelder.

## Evidence

- Die gesetzliche Pflicht existiert objektiv (ArbSchG, DGUV-Vorschriften, BetrSichV) — der Schmerz ist real; die **Zahlungsbereitschaft des Segments ist unbelegt**.
- Marktrecherche (2026-06-12, 35+ Quellen): Die Lücke „alle sechs Prüfarten in einer App + Self-Service + < 50 EUR/Monat + Onboarding < 30 min" ist unbesetzt; Teilwettbewerber (Certado, uvv.app, ElektroPrüfManager) belegen, dass im Segment Self-Service-Käufe stattfinden → teilvalidiert.
- Zahlungsbereitschaft: **Assumption — needs validation via 10 Zielkunden-Gespräche + Landingpage (Monat 1); hartes Kriterium: ≥5 verbindliche Vorbestellungen ODER 1 Prüfdienstleister-LOI** (Council-Verdikt). Billigster Zahlungstest: DGUV-Vorlagen-Paket als 99-EUR-Einmalprodukt.

## Users

- **Primary:** Verantwortliche/r für Arbeitssicherheit bzw. Geschäftsführer in Betrieben mit 5–50 MA (Handwerk, Werkstatt, Produktion, Praxis, Hausverwaltung). Trigger: angekündigte BG-Kontrolle, Unfall im Umfeld, Übernahme der Arbeitsschutz-Verantwortung, Neugründung.
- **Sekundär (V1 nur als Kanal/Design-Partner):** Externe Prüfdienstleister und Sicherheitsfachkräfte (Sifa) mit vielen Kundenbetrieben. Mandantenfähiger Tarif kommt NACH Product-Market-Fit — aber der Kanal wird ab Tag 1 bearbeitet (Council + Marktrecherche: stärkster Wachstumshebel, von keinem Wettbewerber < 100 EUR/Monat dediziert bedient).
- **Not for:** Konzerne/Enterprise-EHS (Quentic-Territory), Betriebe mit bestehender CAFM/CMMS-Suite, reine Elektro-Prüfdienstleister mit Messgeräte-Anbindung (Mebedo-Territory).

## Hypothesis

We believe **ein vorkonfiguriertes Prüfpflichten-Inventar (deutsche Kategorie-Vorlagen mit gesetzlichen Intervallen) + automatische Fristenerinnerungen + Audit-PDF-Export** will **verpasste Prüffristen und fehlende Nachweise beseitigen** for **KMU-Verantwortliche ohne Fachsoftware**.
We'll know we're right when **≥3 zahlende Design-Partner das Tool 60 Tage aktiv nutzen (je ≥5 Geräte erfasst, ≥1 Prüfung dokumentiert, ≥1 Audit-Export erzeugt) und nach dem ersten Abrechnungszeitraum verlängern**.

## Success Metrics

| Metric | Target | How measured |
|---|---|---|
| Vorbestellungen/LOI in Validierung (Monat 1) | ≥5 Vorbestellungen oder 1 Dienstleister-LOI | manuell |
| Zahlende Design-Partner 90 Tage nach Launch | ≥3 | Stripe |
| Aktivierung (≥5 Geräte + ≥1 Prüfung in 14 Trial-Tagen) | ≥60 % | DB-Query |
| Trial→Paid | ≥10 % (ehrlich statt 15–25 % aus Businessplan) | Stripe |
| Erinnerungs-Zustellrate | ≥99 % | Resend-Logs |
| Churn | < 3 %/Monat | Stripe |

## Scope

**MVP** — das Minimum, um die Hypothese zu testen:

1. Registrierung/Login (Supabase Auth, **ein** Benutzer je Betrieb), Betriebsprofil anlegen
2. Geräteinventar mit **Kategorie-Vorlagen** (DGUV V3 ortsveränderlich/ortsfest, Leitern & Tritte, Feuerlöscher, Erste-Hilfe-Material, UVV Fahrzeuge, UVV Flurförderzeuge) inkl. hinterlegter gesetzlicher Standard-Prüfintervalle, je Gerät anpassbar
3. Fälligkeits-Dashboard (überfällig / fällig ≤ 30 Tage / fällig ≤ 60 Tage / ok)
4. Prüfdokumentation: Prüfung erfassen (Datum, Prüfer als Freitext, Ergebnis bestanden/mängel/durchgefallen, Bemerkung, PDF-Anhang), unveränderliche Historie je Gerät; nächste Fälligkeit wird automatisch fortgeschrieben
5. Automatische E-Mail-Erinnerungen 60/30/7 Tage vor Fälligkeit + Eskalations-Mail bei Überfälligkeit (täglicher Cron, idempotent)
6. Audit-Export: ein PDF-Gesamtbericht (alle Geräte, Status, letzte Prüfungen, Nachweisliste)
7. Stripe-Abo: **eine Preisstufe 49 EUR/Monat netto**, 14 Tage Trial ohne Kreditkarte, Customer Portal
8. QR-Code je Gerät (druckbares Etikett, Scan öffnet Geräteakte) — *aufgenommen, weil die Marktrecherche QR-First-Onboarding als entscheidenden UX-Differenziator identifiziert und die Implementierung billig ist; finale Gewichtung nach den Validierungsgesprächen*

**Out of scope (V1)** — explizit nicht gebaut, auch wenn nachgefragt:

- **Mehrbenutzer-UI / Rollen** — Council: nicht hypothesetragend; das Datenmodell ist mandantenfähig vorbereitet (company_id + RLS), nur die Verwaltungs-UI fehlt bewusst
- **Mehrstandort** — dito
- **CSV-Import** — Onboarding der Design-Partner erfolgt founder-geführt
- **Foto-Upload** (nur PDF-Anhang) — Aufwand/Nutzen
- **Mandantenfähigkeit für Dienstleister** — nach PMF; Kanal wird trotzdem ab Tag 1 vertrieblich bearbeitet
- **Unterweisungs-Modul, Mobile App, API/Schnittstellen** — Businessplan-Ausbaustufen
- **Begriff „revisionssicher"** in UI/Marketing — Haftungsrisiko (GoBD-Erwartung); Wording: „lückenlos dokumentiert"

## Delivery Milestones

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | Validierung | Landingpage live; 10 Gespräche; ≥5 Vorbestellungen oder 1 Dienstleister-LOI — **Gate für Launch** | pending | — |
| 2 | Kern-Inventar | Registrieren, Betrieb anlegen, Geräte mit Kategorie-Vorlagen verwalten, Fälligkeiten im Dashboard sehen | complete | ./implementation-plan.md |
| 3 | Prüfdokumentation | Prüfung mit PDF-Nachweis erfassen; Historie je Gerät; Fälligkeit schreibt sich fort | complete | ./implementation-plan.md |
| 4 | Erinnerungs-Engine | Täglicher Cron versendet 60/30/7-Mails + Eskalation, idempotent, ≥99 % Zustellrate | complete | ./implementation-plan.md |
| 5 | Audit-Export | PDF-Gesamtbericht auf Knopfdruck | pending | ./implementation-plan.md |
| 6 | Monetarisierung | Stripe Checkout + Portal, 49 EUR/Monat, 14-Tage-Trial-Logik | pending | ./implementation-plan.md |
| 7 | Design-Partner-Launch | 3 Betriebe founder-geführt onboarded und zahlend | pending | — |

## Open Questions

- [ ] **Nebentätigkeitsgenehmigung des Arbeitgebers erteilt?** → Blocker für Launch, VOR weiterer Investition klären (Council, einstimmig)
- [ ] QR-Codes tatsächlich Kaufauslöser? → nach den 10 Gesprächen gewichten (Marktrecherche: ja; Council: offen)
- [ ] Dienstleister-first als primäres GTM statt nur Kanal? → Gespräche + erste LOIs entscheiden
- [ ] Preis: 49 EUR Einheitstarif vs. 29/59/99 Staffel → Validierung; Marktrecherche stützt 29–99 als plausibles Band
- [ ] UG-Gründung + Vermögensschadenhaftpflicht + AGB vor erstem zahlenden Kunden — Zeitpunkt/Kosten klären (Steuerberater)
- [ ] Vercel (US-Anbieter) trotz Supabase Frankfurt für DSGVO-sensible Käufer akzeptabel? Ggf. EU-Hosting-Alternative prüfen
- [ ] Wie wichtig ist Offline-Erfassung (Prüfung im Keller ohne Netz)? → Gespräche (Kritiker-Hinweis)
- [ ] Öffentliche QR-Leseansicht für externe Prüfer/Auditoren (ohne Login)? Datenschutz-Trade-off — V1 erfordert Login, Entscheidung nach Validierungsgesprächen (Code-Review-Finding 2026-06-12)
- [ ] Reaktion, falls Timly/ToolSense/Lumiform ein KMU-DGUV-Paket < 100 EUR/Monat launchen? (Marktrisiko 1–3)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Conversion-Kette 2–3x zu optimistisch (Konsens Council) | hoch | hoch | Founder-led Design-Partner statt Ads-Funnel; Ziel ehrlich auf 18–24 Monate |
| Prüfdienstleister liefert Erinnerung gratis mit (Hauptwettbewerber des Use Case) | hoch | mittel | Dienstleister als Kanal gewinnen; Argument: Doku-Pflicht bleibt beim Betreiber |
| Solo-Kapazität / Bus-Faktor 1 | hoch | mittel | MVP halbiert; Managed Services (Supabase/Vercel/Stripe/Resend); Support-Erwartung schriftlich begrenzen |
| Haftung bei versagter Erinnerung / „revisionssicher"-Erwartung | niedrig | hoch | UG + Versicherung + AGB-Haftungsklausel; Wording „lückenlos dokumentiert" |
| Nebentätigkeit nicht genehmigt | mittel | fatal | VOR Stunde 1 beantragen (Woche 0) |
| Finanzierter Wettbewerber besetzt Nische (ToolSense/Timly/Lumiform) | mittel | hoch | Schmale Positionierung „alle 6 Prüfarten, eine App"; Geschwindigkeit; Dienstleister-Bindung |
| BG launcht Gratis-Tool | niedrig | hoch | Beobachten; Differenzierung über UX + Erinnerungs-Komfort |

---
*Status: DRAFT — requirements only. Nächster Schritt: `/ecc:plan ./PRD.md` erzeugt implementation-plan.md für Milestone 2.*
