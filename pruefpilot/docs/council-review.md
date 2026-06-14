# Council-Review: PrüfPilot — Go/No-Go & Businessplan-Kritik

*Erstellt: 2026-06-12 · Methode: ECC `council`-Skill — vier unabhängige Stimmen (Architect in-context, Skeptiker/Pragmatiker/Kritiker als frische Subagenten ohne Gesprächskontext, Anti-Anchoring)*

Bewertungsgegenstand: [`businessplan.md`](./businessplan.md) · Konsequenzen für den Produkt-Scope: [`PRD.md`](./PRD.md)

---

## Die vier Positionen (ungekürzt)

### Architect (in-context, vor den externen Stimmen fixiert)

**Position:** Bedingtes Go — der Plan ist als Validierungsplan gut, als Umsatzplan in der Conversion-Kette zu optimistisch; der MVP-Scope ist ~30 % zu groß (Mehrbenutzer/Standorte und CSV-Import gehören nicht in V1).

**Begründung:**
- Gesetzlich erzwungene Nachfrage + wiederkehrender natürlicher Nutzen (Erinnerungen) = strukturell gutes SaaS mit niedrigem Churn-Potenzial.
- Stack-Fit und Solo-Machbarkeit: Supabase/Next.js/Stripe ist für diese App-Klasse (CRUD + Cron + PDF) ideal; 150–250 h plausibel, WENN der Scope hart begrenzt wird.
- Der Plan enthält bereits die richtige Reißleine (30-Tage-Validierung mit Abbruchkriterium).

**Risiko der eigenen Empfehlung:** Die schwächste Stelle ist nicht Technik, sondern Distribution — gilt real eher 1 % × 10 % statt 3 % × 20 %, verzehnfacht sich der nötige Traffic und das 18-Monats-Ziel kippt.

### Skeptiker

**Position:** No-Go für den Bau jetzt — Go nur für eine verschärfte 30-Tage-Validierung mit Zahlungsbeweis. Vorher die einfachere Alternative testen: Einstieg über Prüfdienstleister/Sifas, nicht Self-Service an KMU.

**Begründung:**
- **Falsches Wettbewerbs-Framing.** Der Gegner ist nicht die Enterprise-EHS-Suite, sondern Excel plus der externe Prüfdienstleister, dessen Doku-Software kostenlos mitkommt. KMU haben kein aktives Kaufmoment — sie handeln erst, wenn die BG prüft. Conversion-Kette „3 % Besucher→Trial, 15–25 % Trial→Paid" ist reine Fiktion; realistisch eher 1 % / 5–10 %, also 3–4× mehr Traffic nötig.
- **Self-Service widerspricht dem Segment.** Onboarding heißt: Inventar erfassen, QR-Etiketten kleben — Arbeit, die kein Handwerksbetrieb unbegleitet im Trial freiwillig macht. Ohne Aktivierungshilfe stirbt die Conversion genau dort.
- **Kapazität und Scope passen nicht.** Mandantenfähigkeit, Mehrbenutzer, Standorte, PDF-Audit: solo eher 400+ h als 250 h. Support zu Geschäftszeiten neben Vollzeitjob geht nicht; Nebentätigkeitsgenehmigung im öffentlichen Dienst nötig.

**Risiko:** Über-Skepsis kostet Vorsprung — deshalb hart timeboxen, aber Abbruchkriterium verschärfen: nicht „20 Interessenten" (Interesse ist gratis), sondern 10 Vorbestellungen oder unterschriebene LOIs.

**Überraschung:** Das beworbene Differenzierungsmerkmal — „deutsche Rechts-Vorlagen" — fehlt im MVP-Scope komplett. Die billigste Validierung: Die Vorlagen als eigenständiges Produkt für 99 € einmalig verkaufen. Kauft das niemand, kauft auch niemand das SaaS — Entwicklungskosten: null.

### Pragmatiker

**Position:** Go mit Änderungen — aber nur, wenn der Plan vom Self-Service-Märchen auf founder-led Verkauf umgestellt und der MVP halbiert wird. Kunde Nr. 1 kommt aus den 10 Validierungsgesprächen, nicht aus Google Ads.

**Begründung:**
- **Die Conversion-Kette ist Fiktion für diesen Founder.** SEO trägt frühestens nach 9–12 Monaten; Handwerksbetriebe *suchen* diese Software nicht. Realistischer Weg: 3 Design-Partner aus den Validierungsgesprächen, die *vor* Fertigstellung einen rabattierten Jahrespreis zahlen — Validierung UND Cashflow.
- **MVP halbieren.** Kern: Inventar + Fristen + E-Mail-Erinnerung + PDF-Nachweis. Raus für V1: Mehrbenutzer, Standorte, QR-Etiketten, Foto-Upload. Spart 60–100 h. Stripe, AVV, DSGVO, AGB fressen ungeplante 30–50 h.
- **Zeitverschwendung in den ersten 6 Monaten:** Partnerprogramm mit Provisionslogik, drei Preisstufen (eine reicht: 49 €), Software-Verzeichnisse, E-Mail-Automation, mandantenfähiger Tarif — alles Skalierungswerkzeug ohne etwas zum Skalieren.

**Risiko:** Der verschlankte MVP könnte am Kernsegment vorbeischneiden — wenn QR-Scan am Gerät *der* Kaufauslöser ist, war die Streichung falsch. Deshalb: Schnitt erst NACH den 10 Gesprächen fixieren.

**Überraschung:** Der gefährlichste Wettbewerber ist kostenlos: Der externe Prüfdienstleister erinnert seine Kunden ohnehin — das Kernfeature gibt es gratis dazu. Gleichzeitig ist genau dieser Dienstleister der schnellste Kanal: einer bringt 20 Betriebe. Das „Sekundärsegment" gehört an die erste Stelle. Nebentätigkeitsgenehmigung *vor* der ersten Codezeile beantragen.

### Kritiker

**Position:** Go-mit-Änderungen — aber nur nach hartem Validierungsmonat mit Zahlungsbereitschafts-Test (Vorbestellung/LOI), nicht bloß „Interessenten". Sonst No-Go.

**Begründung:**
- **Conversion-Kette ist Wunschdenken multipliziert:** 3 % × 15–25 % bei Self-Service an Handwerker ist Top-Quartil. Realistisch: 1–1,5 % × 5–10 %. Dann braucht es 400–700 Trials statt 180–250 — bei CPCs, die für Compliance-Keywords eher 3–6 € liegen, rechnet sich der Funnel nicht.
- **Der „freie Markt" ist besetzt — durch Trägheit und den Prüfdienstleister:** Excel kostet null, der externe DGUV-V3-Prüfer liefert die Doku gleich mit. Der sekundäre Zielkunde ist in Wahrheit der Hauptwettbewerber des primären Use Case.
- **Solo + Vollzeit + öffentlicher Dienst ist ein dreifacher Engpass:** Genehmigung kann verweigert/widerrufen werden (vor Stunde 1 klären). KMU erwarten Telefonsupport. Bus-Faktor 1 bei einem Produkt, dessen Wert „wir erinnern dich an Pflichttermine" ist — Ausfall = Vertrauensbruch.

**Risiko:** Der Validierungsmonat könnte falsch-positiv ausfallen: 20 höfliche „klingt interessant" sind kein Kaufsignal. Kriterium: ≥5 verbindliche Vorbestellungen oder Stopp.

**Überraschung:** **„Revisionssicher" ist eine Haftungsfalle, kein Feature.** Der Begriff weckt GoBD-/Normerwartungen, die eine Solo-App auf Vercel/Supabase (US-Subprozessoren!) nicht belegen kann. Versagt die 7-Tage-Erinnerung und ein ungeprüftes Gerät verursacht einen Unfall, steht der Founder ohne Haftungskapital da — UG/GmbH + Vermögensschadenhaftpflicht + wasserdichte AGB gehören in den MVP-Scope. Außerdem fehlt: Offline-fähige mobile Erfassung — geprüft wird im Keller ohne Netz.

---

## Verdict

- **Konsens (4/4):**
  - Conversion-Kette 2–3× zu optimistisch (realistisch ~1–1,5 % Besucher→Trial, ~5–10 % Trial→Paid → 400–700 statt 180–250 Trials nötig).
  - MVP-Scope zu groß.
  - Abbruchkriterium „20 Interessenten" zu weich — nur Geld zählt.
- **Konsens (3/3 extern), der die Architect-Position geändert hat:**
  1. **Prüfdienstleister-Kanal an die ERSTE Stelle** — gleichzeitig gefährlichster Gratis-Wettbewerber und schnellster Vertriebsweg (einer bringt 20 Betriebe).
  2. **Validierung braucht Zahlungsbeweis:** ≥5 verbindliche Vorbestellungen/LOIs oder Stopp.
- **Stärkster Dissens:** Skeptiker — kein SaaS bauen, bevor das Vorlagen-Produkt (99 € einmalig) Zahlungsbereitschaft bewiesen hat. Ironie: Das beworbene Differenzierungsmerkmal „deutsche Rechts-Vorlagen" fehlt im Businessplan-MVP komplett.
- **Prämissen-Check:** Bestanden mit Befund — „Self-Service an KMU" widerspricht dem Segment (Onboarding = physische Arbeit, macht kein Betrieb unbegleitet).

### Empfehlung (synthetisiert)

1. **Woche 0:** Nebentätigkeitsgenehmigung beim Arbeitgeber beantragen — kann Wochen dauern, kann Auflagen enthalten. Blocker für alles Weitere.
2. **Monat 1:** Validierung mit hartem Kriterium: **≥5 verbindliche Vorbestellungen ODER 1 Prüfdienstleister-LOI.** Vorlagen-Produkt (99 € einmalig) als billigster Zahlungstest.
3. **MVP halbiert:** Inventar + Kategorie-Vorlagen mit Prüfintervallen + Fälligkeits-Dashboard + Erinnerungen (60/30/7 + Eskalation) + Prüfdoku mit PDF-Anhang + Audit-PDF-Export. **Raus aus V1:** Mehrbenutzer-UI, Mehrstandort, CSV-Import, Foto-Upload, Mandantenfähigkeit. **QR:** Entscheidung erst nach den 10 Gesprächen. **Eine Preisstufe (49 €)** statt drei.
4. **Go-to-Market:** Founder-led mit 3 zahlenden Design-Partnern (rabattierter Jahrespreis vor Fertigstellung); Prüfdienstleister als Primärkanal; Ads/SEO/Verzeichnisse/Partnerprogramm erst nach zahlendem Kunden Nr. 3.
5. **Wording & Recht:** „Revisionssicher" streichen → „lückenlos dokumentiert". UG + Vermögensschadenhaftpflicht + AGB-Haftungsausschluss für verpasste Erinnerungen **vor** dem ersten zahlenden Kunden.
6. **Zeitziel ehrlich:** 20.000 €/Jahr ist ein 18–24-Monats-Ziel.
