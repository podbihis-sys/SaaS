# adriawebcode – Agentur-Website

Moderne, mehrsprachige Marketing-Website mit automatischer Lead-Generierung und
Sofort-Angebotserstellung für die Webdesign-Agentur **adriawebcode** (gegründet 2024).

## Features

- **5 Sprachen**: Deutsch, Englisch, Kroatisch, Bosnisch, Serbisch – automatische
  Spracherkennung per Browser, umschaltbar im Header, korrekte `hreflang`-Tags.
- **Automatische Angebotserstellung**: Das Kontaktformular fragt u. a.
  „Haben Sie bereits eine Website?" – bei *Ja* wird die angegebene URL live
  gescrapt und analysiert (HTTPS, Meta-Tags, Mobile-Optimierung, Ladezeit,
  strukturierte Daten, CMS-Erkennung). Aus Projektart, Umfang, Sprachen,
  Zielmarkt und Analyse-Ergebnis wird sofort ein Angebot mit marktüblichen
  Preisen berechnet und angezeigt – inkl. Positionen, Preisspanne, Zeitplan
  und Wartungsempfehlung.
- **Regionale Preise**: DACH (Faktor 1.0–1.15) vs. Adria-Region (0.75–0.85).
- **3 Wartungsverträge**: Basic 39 € / Business 89 € / Premium 179 € pro Monat.
- **Kein Hosting-Angebot** – bewusst kommuniziert.
- **SEO**: Metadata pro Sprache, `sitemap.xml`, `robots.txt`, JSON-LD
  (ProfessionalService + FAQPage), OG-Tags, Canonical + hreflang.
- **Animationen**: Framer Motion (Scroll-Reveals, Stagger, Hero-Gradient,
  Marquee, animierte Angebots-Anzeige), respektiert `prefers-reduced-motion`.

## Lokal starten

```bash
cd adriawebcode
npm install
npm run dev   # http://localhost:3000
```

## Deployment auf Vercel

1. Auf [vercel.com](https://vercel.com/new) das GitHub-Repo importieren.
2. **Root Directory** auf `adriawebcode` setzen (das Repo ist ein Monorepo).
3. Framework „Next.js" wird automatisch erkannt – deployen.
4. Environment-Variablen setzen (siehe `.env.example`):
   - `NEXT_PUBLIC_SITE_URL` – die finale Domain (wichtig für SEO).
   - `RESEND_API_KEY` – optional, für E-Mail-Versand der Angebote
     (kostenloser Account auf [resend.com](https://resend.com)).
   - `LEAD_NOTIFY_EMAIL` – E-Mail für Lead-Benachrichtigungen
     (Standard: podbihis@gmail.com).

Ohne `RESEND_API_KEY` funktioniert die Seite vollständig – Angebote werden dem
Interessenten im Browser angezeigt und Leads im Vercel-Log protokolliert; es
werden nur keine E-Mails versendet.

## Vor dem Livegang

- `src/app/[locale]/impressum/page.tsx`: Anschrift, Inhaber und USt-IdNr. eintragen.
- `src/app/[locale]/datenschutz/page.tsx`: Anschrift eintragen.
- Preise/Pakete bei Bedarf in `src/lib/quote.ts` (Engine) und den
  Dictionaries unter `src/i18n/dictionaries/` (Anzeige) anpassen.

## Struktur

```
src/
  app/[locale]/        Seiten (Home, Impressum, Datenschutz), Layout mit SEO
  app/api/lead/        Lead-API: Scraping → Analyse → Angebot → E-Mail
  components/          Header, Hero, Sections, FAQ, ContactForm, Footer
  i18n/                Locale-Konfiguration + Übersetzungen (de/en/hr/bs/sr)
  lib/                 scraper.ts (Website-Analyse), quote.ts (Preis-Engine),
                       notify.ts (Resend-E-Mails)
  middleware.ts        Sprach-Erkennung & Redirect auf /de, /en, /hr, /bs, /sr
```
