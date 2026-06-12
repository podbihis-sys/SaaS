# Businessplan: „PrüfPilot" — SaaS für gesetzliche Prüftermine in KMU

*Stand: Juni 2026 · Solo-Founder-Modell · Ziel: ≥ 20.000 € Jahresumsatz, vollautomatisierter Vertrieb*

> **Hinweis:** Dies ist der ursprüngliche Businessplan (Quelle: Founder). Das kritische Review mit
> Korrekturen an Conversion-Annahmen, MVP-Scope und Go-to-Market steht in
> [`council-review.md`](./council-review.md). Der daraus abgeleitete, verbindliche Produkt-Scope
> steht in [`PRD.md`](./PRD.md).

---

## 1. Executive Summary

PrüfPilot ist eine deutschsprachige Web-Anwendung, mit der kleine und mittlere Unternehmen alle gesetzlich vorgeschriebenen Prüfungen und Unterweisungen zentral verwalten: DGUV-V3-Prüfung elektrischer Geräte, Leitern & Tritte, Feuerlöscher, Erste-Hilfe-Material, UVV-Prüfung von Fahrzeugen und Flurförderzeugen, Sicherheitsunterweisungen der Mitarbeiter.

Das Problem ist real und gesetzlich erzwungen: Jeder Betrieb in Deutschland muss diese Prüfungen nachweisen können (Arbeitsschutzgesetz, DGUV-Vorschriften, Betriebssicherheitsverordnung). In der Praxis wird das mit Excel-Listen, Aktenordnern und Klebeetiketten verwaltet — Termine werden vergessen, bei Audits oder nach Unfällen fehlen Nachweise, und es drohen Bußgelder und Haftungsrisiken für den Geschäftsführer.

PrüfPilot löst das mit: Geräteinventar per QR-Code, automatischen Erinnerungen vor Fälligkeit, revisionssicherer Dokumentation und einem Audit-Export auf Knopfdruck.

**Geschäftsmodell:** Self-Service-Abo (29–99 €/Monat), 14 Tage kostenlos testen, Bezahlung per Stripe — kein Vertriebsgespräch nötig. Zielumsatz von 20.000 €/Jahr wird mit ca. 30–40 zahlenden Kunden erreicht.

**Warum dieses Produkt zum Founder passt:** Compliance-Denken und Asset-Verwaltung aus dem Sysadmin-Alltag (MDM, AD-Audits), passender Tech-Stack (Flutter/Web, Supabase, Stripe/RevenueCat), Sprache des Zielmarkts. Die Nische ist klein genug, dass große Anbieter sie ignorieren, aber groß genug für das Umsatzziel.

---

## 2. Problem & Lösung

### Das Problem

- Über 3 Mio. Betriebe in Deutschland unterliegen Prüfpflichten — vom Handwerksbetrieb über die Arztpraxis bis zur Hausverwaltung.
- Die DGUV-V3-Prüfung ortsveränderlicher elektrischer Geräte ist z. B. je nach Geräteklasse alle 6–24 Monate fällig. Dazu kommen Feuerlöscher (alle 2 Jahre), Leitern (jährlich), Erste-Hilfe-Kästen (Verfallsdaten), UVV-Fahrzeugprüfungen (jährlich).
- Verwaltet wird das typischerweise in Excel oder gar nicht. Folgen: verpasste Fristen, fehlende Nachweise bei Berufsgenossenschafts-Audits, persönliche Haftung der Geschäftsführung nach Arbeitsunfällen.
- Bestehende Software (z. B. große EHS-/CAFM-Suiten) ist auf Konzerne ausgelegt: teuer, überladen, mit Vertriebsprozess. Für einen 15-Mann-Betrieb gibt es kaum etwas Schlankes zum Selbst-Buchen.

### Die Lösung — Kernfunktionen (MVP)

1. **Geräte- & Objektinventar** — Anlegen per Formular oder CSV-Import; Kategorien mit hinterlegten gesetzlichen Prüfintervallen (vorkonfigurierte Vorlagen: DGUV V3, Leitern, Feuerlöscher, Erste Hilfe, UVV).
2. **QR-Code-Etiketten** — pro Gerät generierbar und druckbar; Scan mit dem Handy öffnet die Geräteakte (letzte Prüfung, nächste Fälligkeit).
3. **Automatische Erinnerungen** — E-Mail 60/30/7 Tage vor Fälligkeit an den Verantwortlichen; Eskalation an die Geschäftsführung bei Überfälligkeit.
4. **Prüfdokumentation** — Prüfung erfassen (Datum, Prüfer, Ergebnis, Foto/PDF des Prüfprotokolls), revisionssicher mit Zeitstempel.
5. **Audit-Export** — PDF-Bericht „Alle Prüfungen, Status, Nachweise" auf Knopfdruck — das Killer-Feature für BG-Kontrollen.
6. **Mehrbenutzer & Standorte** — einfache Rollen (Admin, Erfasser, Nur-Lesen), mehrere Standorte ab Pro-Tarif.

### Spätere Ausbaustufen (nach Product-Market-Fit)

- Mobile App (Flutter) für Offline-Erfassung vor Ort
- Mandantenfähigkeit für externe Prüfdienstleister (die verwalten Dutzende Kundenbetriebe — höherer Tarif)
- Unterweisungs-Modul (Mitarbeiter-Schulungen mit Bestätigung per Klick)
- Schnittstellen (CSV/API), später ggf. Anbindung an Prüfgeräte-Hersteller

---

## 3. Zielmarkt & Kundensegmente

**Primärsegment:** Betriebe mit 5–50 Mitarbeitern, die einen „Verantwortlichen für Arbeitssicherheit" haben, aber keine eigene Software: Handwerksbetriebe, Werkstätten, Produktionsbetriebe, Pflegeeinrichtungen, Praxen, Schulen/Vereine, Hausverwaltungen.

**Sekundärsegment (höherer Warenkorb):** Externe Prüfdienstleister und Sicherheitsfachkräfte (Sifa/FaSi), die viele Kundenbetriebe betreuen — sie zahlen 99 €+/Monat für Mandantenfähigkeit und bringen ihre Kunden gleich mit (eingebauter Vertriebskanal!).

**Marktgröße (konservativ):** Selbst wenn nur 0,01 % der prüfpflichtigen Betriebe in DACH Kunde werden, sind das ~300 Kunden — das Zehnfache des Ziels. Kein Massenmarkt nötig, nur eine sichtbare Nische.

**Wettbewerb:** Es gibt Anbieter (z. B. große EHS-Suiten, Wartungsplaner-Tools), aber die meisten sind entweder Enterprise-orientiert (Vertrieb, Preis auf Anfrage) oder generische Wartungsplaner ohne deutsche Rechts-Vorlagen. Differenzierung: **deutsch, gesetzeskonform vorkonfiguriert, in 10 Minuten selbst eingerichtet, transparenter Preis.** Vor dem Start: 2–3 Stunden Konkurrenzrecherche zu aktuellen Anbietern und Preisen einplanen.

---

## 4. Produkt & Tech-Stack

| Komponente | Wahl | Begründung |
|---|---|---|
| Frontend | Next.js (Web-First) oder Flutter Web | Web-First empfohlen: B2B-Kunden sitzen am Desktop; SEO-fähige Landingpage im selben Projekt |
| Backend/DB | Supabase (Postgres, Auth, Storage, Edge Functions) | Bekannt; Row Level Security für Mandantentrennung |
| Zahlungen | Stripe Billing (Checkout + Customer Portal) | Self-Service-Abos, Rechnungen, EU-USt automatisch via Stripe Tax |
| E-Mails | Resend oder Postmark | Transaktionale Erinnerungs-Mails, hohe Zustellrate |
| PDF-Export | serverseitig (z. B. react-pdf / Puppeteer in Edge Function) | Audit-Berichte |
| Hosting | Vercel + Supabase Cloud | Nahezu null DevOps |
| Später: Mobile | Flutter + RevenueCat | Bestehender Stack |

**MVP-Aufwand:** realistisch 150–250 Stunden neben dem Job (ca. 3–4 Monate bei 15 h/Woche). Mit Claude Code als Entwicklungs-Beschleuniger eher am unteren Ende.

**DSGVO:** Supabase-Region Frankfurt wählen, AV-Vertrag mit Supabase/Stripe abschließen, Datenschutzerklärung und AVV-Muster für Kunden bereitstellen. DSGVO-Konformität ist im deutschen B2B ein Verkaufsargument — prominent auf die Landingpage.

---

## 5. Preismodell

| Tarif | Preis (netto/Monat) | Enthalten |
|---|---|---|
| **Starter** | 29 € | 1 Standort, bis 100 Geräte, 2 Benutzer |
| **Pro** | 59 € | 3 Standorte, bis 500 Geräte, 10 Benutzer, CSV-Import, Audit-Export |
| **Dienstleister** | 99 € | Mandantenfähig (bis 15 Kundenbetriebe), White-Label-Berichte |

- Jahreszahlung mit 2 Monaten Rabatt (z. B. Pro: 590 €/Jahr) → verbessert Cashflow und senkt Kündigungen.
- 14 Tage kostenloser Test ohne Kreditkarte → niedrige Einstiegshürde, klassischer Self-Service-Funnel.
- Preise netto ausweisen (B2B-üblich), USt über Stripe Tax.

### Weg zu 20.000 €/Jahr

| Szenario | Kundenmix | MRR | Jahresumsatz |
|---|---|---|---|
| Konservativ | 25× Starter, 10× Pro, 3× Dienstleister | ~1.612 € | ~19.300 € |
| Ziel | 25× Starter, 15× Pro, 5× Dienstleister | ~2.105 € | ~25.300 € |

**Benötigt: nur ~35–45 zahlende Kunden.** Bei einer typischen Trial-zu-Bezahlt-Quote von 15–25 % braucht es dafür ~180–250 Test-Anmeldungen über 12–18 Monate — etwa 4–5 pro Woche. Das ist mit SEO + kleinen Ads-Budgets erreichbar.

---

## 6. Automatisierter Vertrieb (Go-to-Market)

Grundprinzip: Der Kunde findet das Produkt, testet selbst, bucht selbst. Keine Verkaufsgespräche.

### Kanal 1: SEO (wichtigster Kanal, Wirkung ab Monat 4–6)

Die Nische hat kaufnahe Suchbegriffe mit geringer Konkurrenz:
- „DGUV V3 Prüfung Software", „Prüffristen verwalten Software"
- „Feuerlöscher Prüfung Frist Übersicht", „Leiternprüfung dokumentieren"
- „Prüfprotokoll Vorlage" + kostenlose Vorlagen als Lead-Magnet

Plan: 2 Blogartikel/Monat (mit Claude vorbereitet, fachlich geprüft) + kostenlose Tools („Prüffristen-Rechner", „DGUV-V3-Checkliste als PDF gegen E-Mail-Adresse").

### Kanal 2: Google Ads (sofortige Wirkung, Budget 200–300 €/Monat)

Exakt auf Kauf-Keywords („Prüftermine Software", „Wartungsplaner DGUV"). Bei Nischen-CPCs von 1–3 € und 2–4 % Conversion zur Testphase sind 10–20 Trials/Monat realistisch.

### Kanal 3: Multiplikatoren (halbautomatisch)

- Sicherheitsfachkräfte (Sifa) und Prüfdienstleister: Affiliate-/Partnerprogramm (20 % wiederkehrende Provision) — sie empfehlen das Tool ihren Kunden.
- Einträge in Software-Verzeichnisse (OMR Reviews, Capterra, trusted.de).
- 2–3 Fachgruppen (XING/LinkedIn „Arbeitssicherheit") mit hilfreichen Beiträgen, nicht mit Werbung.

### Kanal 4: E-Mail-Automation

Trial-Onboarding-Sequenz (Tag 0/3/7/12), Reaktivierungs-Mails, Fristen-Newsletter („Was ändert sich 2027 bei der DGUV?"). Komplett automatisiert mit Resend/Brevo.

---

## 7. Finanzplan (Jahr 1)

### Kosten (laufend, pro Monat)

| Posten | Kosten |
|---|---|
| Supabase Pro | ~25 € |
| Vercel Pro | ~20 € |
| E-Mail (Resend/Brevo) | ~15 € |
| Domain, Tools, Backups | ~15 € |
| Google Ads | 200–300 € |
| Stripe-Gebühren | ~2 % vom Umsatz |
| **Summe** | **~280–380 €/Monat ≈ 3.500–4.500 €/Jahr** |

Einmalig: Gewerbeanmeldung (~30 €), ggf. Steuerberater-Erstberatung (~300 €), Rechtstexte (AGB/Datenschutz, z. B. eRecht24/IT-Recht-Kanzlei ~15–30 €/Monat oder einmalig).

### Umsatzentwicklung (realistisch)

| Phase | Zeitraum | Zahlende Kunden | MRR |
|---|---|---|---|
| Build | Monat 1–4 | 0 | 0 € |
| Launch + erste Kunden | Monat 5–8 | 5–12 | 250–600 € |
| Wachstum (SEO greift) | Monat 9–14 | 15–30 | 800–1.600 € |
| Ziel erreicht | Monat 15–20 | 35–45 | ≥ 1.700 € |

**Break-even** (laufende Kosten gedeckt): ab ca. 8–10 Kunden, also realistisch Monat 7–9. Das 20.000-€-Ziel ist eher ein 18-Monats-Ziel als ein 12-Monats-Ziel.

### Rechtsform & Nebentätigkeit

- Start als Einzelunternehmen (Kleinunternehmerregelung prüfen — bei B2B-Kunden ist Regelbesteuerung oft sogar vorteilhaft, da Vorsteuerabzug).
- **Wichtig:** Nebentätigkeit beim Arbeitgeber anzeigen/genehmigen lassen — als Angestellter im öffentlichen Umfeld meist meldepflichtig.
- Diese Punkte mit einem Steuerberater bzw. der Personalabteilung klären — keine Rechts-/Steuerberatung.

---

## 8. Roadmap (18 Monate)

**Monat 1:** Validierung — Landingpage „Coming Soon" mit E-Mail-Liste, 10 Gespräche mit Zielkunden (Handwerker im Bekanntenkreis, Sifa-Foren), Konkurrenz- und Keyword-Recherche. *Abbruchkriterium: Wenn nach 30 Tagen < 20 Interessenten auf der Liste sind und Gespräche kein Schmerzempfinden zeigen → Idee anpassen, bevor Code entsteht.*

**Monat 2–4:** MVP bauen (Inventar, Fristen, Erinnerungen, PDF-Export, Stripe). 3–5 Pilotkunden gratis für Feedback + Testimonials.

**Monat 5:** Launch — Ads an, Verzeichniseinträge, erste Blogartikel, ProductHunt/OMR optional.

**Monat 6–12:** 2 Artikel/Monat, Funnel-Optimierung (Trial→Paid-Quote messen!), Dienstleister-Tarif + Partnerprogramm, Audit-Export verfeinern.

**Monat 12–18:** Flutter-App für mobile Erfassung, Unterweisungs-Modul, Preiserhöhung für Neukunden testen.

---

## 9. Risiken & Gegenmaßnahmen

| Risiko | Wahrscheinlichkeit | Gegenmaßnahme |
|---|---|---|
| Nische zu träge / Kunden bleiben bei Excel | mittel | Validierung VOR dem Bauen (Monat 1); Lead-Magnete testen Nachfrage |
| Etablierter Wettbewerber dominiert SEO | mittel | Long-Tail-Keywords, kostenlose Tools, Dienstleister-Kanal als Umgehung |
| Zeitmangel neben Job & Familie | hoch | MVP klein halten, Claude Code nutzen, feste 10–15 h/Woche blocken |
| Churn (Kunden kündigen) | mittel | Jahresabos pushen, Erinnerungen = wiederkehrender Nutzen = natürliche Bindung |
| Rechtliche Anforderungen (DSGVO, AGB) | niedrig | Standard-Rechtstexte, EU-Hosting, AVV-Vorlage |

---

## 10. KPIs (monatlich tracken)

- Website-Besucher → Trial-Anmeldungen (Ziel: ≥ 3 % Conversion)
- Trial → zahlend (Ziel: ≥ 20 %)
- MRR & Netto-Neukunden
- Churn-Rate (Ziel: < 3 %/Monat)
- CAC über Ads (Ziel: < 3 Monatsbeiträge pro gewonnenem Kunden)

---

## Fazit

PrüfPilot kombiniert eine gesetzlich erzwungene Zahlungsbereitschaft mit einem unterversorgten KMU-Segment und dem vorhandenen Tech-Stack des Founders. Das 20.000-€-Ziel erfordert nur ~40 Kunden und keinen aktiven Vertrieb — dafür Geduld (realistisch 15–20 Monate), konsequentes SEO und einen kleinen, wirklich fertigen MVP. Der wichtigste nächste Schritt kostet nichts: **30 Tage Validierung, bevor eine Zeile Code entsteht.**
