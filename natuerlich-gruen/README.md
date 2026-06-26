# natürlich grün – Website-Relaunch

Moderner, schneller und sicherheitsoptimierter Nachbau der Website
[natuerlichgruen.net](https://natuerlichgruen.net) – naturnaher Garten- und
Landschaftsbau in der Eifel (Bad Münstereifel). Inhaltlich 1:1 übernommen,
technisch komplett neu auf Basis von **Next.js (App Router)** + **Tailwind CSS**.

## Highlights

- ⚡ **Next.js 15 / React 19** mit serverseitigem Rendering – top für SEO & Performance
- 🎨 **Tailwind CSS**, mobile-first, Markenfarben (warmes Grün `#98c188` / Anthrazit `#3f3e3e`)
- 🔍 **SEO**: pro Seite eigener Title/Meta, Canonical, Open Graph/Twitter, JSON-LD
  (`LandscapingBusiness`, `BreadcrumbList`, `Article`), automatische
  `sitemap.xml` & `robots.txt`
- 🔒 **Sicherheit**: strenge Security-Header (CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- 📨 **Kontaktformular** mit serverseitiger Validierung (Zod), Honeypot,
  Rate-Limiting und optionalem Cloudflare-Turnstile – Versand via Resend
- ♿ **Barrierefreiheit** (WCAG 2.1 AA): `lang="de"`, Fokus-Indikatoren,
  Tastaturbedienung, ARIA-Labels, „Skip-Link“, korrekte Überschriften
- 🍪 **DSGVO**: nur technisch notwendige Cookies, informierender Consent-Hinweis,
  kein Tracking
- 🖼️ **Bilder** via `next/image` → automatisch WebP/AVIF, responsive `srcset`, Lazy-Loading
- 🌱 Dezente Scroll-Animationen, die `prefers-reduced-motion` respektieren

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx            # Root-Layout: Fonts, Metadaten, Header/Footer, JSON-LD
│   ├── page.tsx              # Startseite (alle Sektionen)
│   ├── globals.css           # Tailwind + Basis-Styles
│   ├── sitemap.ts            # automatische sitemap.xml
│   ├── robots.ts             # automatische robots.txt
│   ├── not-found.tsx         # 404-Seite
│   ├── ueber-uns/            # Über uns
│   ├── bioland/              # Bioland & Nachhaltigkeit
│   ├── blog/                 # Blog-Index + /blog/[slug]
│   ├── leistungen/           # Übersicht + /leistungen/[slug]
│   ├── pools/                # Naturpools & Schwimmteiche
│   ├── kontakt/              # Kontaktseite
│   ├── impressum/ datenschutz/
│   └── api/kontakt/route.ts  # serverseitige Formularverarbeitung
├── components/               # Header, Footer, ContactForm, CookieBanner, …
└── lib/                      # site.ts, services.ts, blog.ts, jsonld.tsx
```

## Setup

Voraussetzung: **Node.js ≥ 20**.

```bash
npm install
cp .env.example .env.local   # Werte eintragen (siehe unten)
npm run dev                  # http://localhost:3000
```

Produktion:

```bash
npm run build
npm run start
```

## Umgebungsvariablen (`.env.local`)

| Variable | Zweck |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Basis-URL für Canonical, Sitemap, Open Graph |
| `RESEND_API_KEY` | API-Key für E-Mail-Versand ([resend.com](https://resend.com)); ohne Key wird nur geloggt |
| `CONTACT_FROM_EMAIL` | verifizierte Absenderadresse |
| `CONTACT_TO_EMAIL` | Empfänger der Kontaktanfragen (Standard: `info@natuerlichgruen.net`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | optionaler Spam-Schutz (Cloudflare Turnstile) |

> **Turnstile aktivieren:** Beide Keys setzen **und** die Cloudflare-Domain
> `https://challenges.cloudflare.com` in der CSP (`next.config.mjs`,
> `script-src`/`frame-src`) ergänzen.

## Deployment

Empfohlen: **Vercel** oder **Netlify** (automatisch HTTPS, HTTP/2, globales CDN).

1. Repository mit dem Hosting-Account verbinden.
2. Umgebungsvariablen im Projekt-Dashboard hinterlegen.
3. Deploy starten – Build-Command `npm run build`, Output wird automatisch erkannt.

Die Security-Header werden über `next.config.mjs` ausgeliefert und gelten auch
auf Vercel/Netlify.

## Inhaltspflege

- **Blogbeiträge**: `src/lib/blog.ts` – strukturierte Blöcke (`h2`, `h3`, `p`,
  `ul`). Für redaktionelle Pflege durch den Kunden kann das Modul später gegen
  ein Headless-CMS (z. B. Sanity, Contentful) oder MDX ausgetauscht werden.
- **Leistungen**: `src/lib/services.ts`
- **Unternehmensdaten / Navigation / Social**: `src/lib/site.ts`
- **Galerie**: `src/components/Gallery.tsx` – aktuell stilisierte Platzhalter.
  Sobald echte Projektfotos vorliegen, das `items`-Array mit Bild-URLs und
  beschreibenden Alt-Texten befüllen.

### ⚠️ Offene Platzhalter (vor Livegang ersetzen)

- **Testimonials** auf der Startseite enthalten bewusst markierte
  Lorem-ipsum-/„Max Mustermann“-Platzhalter (gelb hervorgehoben). Echte
  Kundenstimmen in `src/app/page.tsx` (Sektion „Testimonials“) eintragen.
- **Impressum** & **Datenschutz**: rechtliche Angaben (vollständige Anschrift,
  Registernummer, USt-IdNr.) ergänzen und juristisch prüfen lassen.
- **Galerie-Bilder**: echte Projektfotos ergänzen.

## Bilder / Assets

Logo, Favicon und Siegel werden zunächst direkt aus der bestehenden
WordPress-Mediathek geladen (über `next/image` automatisch zu WebP/AVIF
optimiert). Für maximale Unabhängigkeit empfiehlt es sich, die Dateien nach
`/public` zu kopieren und die Pfade in `src/lib/site.ts` anzupassen.

## Qualitäts-Checks

- `npm run build` – Produktionsbuild
- `npm run lint` – ESLint (Next Core Web Vitals)
- Lighthouse: Ziel ≥ 90 in Performance, SEO, Best Practices, Accessibility
