# Stomatolog Beograd — komplette Website (Redesign)

Eigenständiges Redesign der Website <https://www.stomatologbeograd.co.rs> mit **allen Seiten aus dem Menü**, dreisprachig (SR/EN/DE).

Vom Original übernommen wurden ausschließlich: **Logo, Bilder (Titelbilder, Service-Teaser, Galerien), Texte, Verlinkungen und die Menüstruktur**. Das Design ist komplett neu und unabhängig vom alten Auftritt.

## Inhalt

- `index.html` — die komplette Website als eine einzige, in sich geschlossene Datei (alle Bilder eingebettet, Hash-Routing per Vanilla-JS, kein Framework, kein Build). Auf beliebigem Webhosting lauffähig; Seiten sind über `#/de/kontakt` usw. verlinkbar.
- `images/` — alle Original-Bilddateien als Referenz (Titelbilder SR/EN, Service-Teaser, Galerie Ordination, Galerie Dentaltourismus).

## Seiten (pro Sprache)

| Seite | SR | EN | DE |
|---|---|---|---|
| Startseite (mit Hero, Leistungs-Grid, Text, Banner, Patientenstimmen) | ✓ | ✓ | ✓ |
| O nama / About us / Über uns | ✓ | ✓ | ✓ |
| Oralna hirurgija / Oral Surgery / Oralchirurgie | ✓ | ✓ | ✓ |
| Stomatološka protetika / Dental Prosthesis / Zahnprothetik | ✓ | ✓ | ✓ |
| Endodoncija / Endodontics / Endodontie | ✓ | ✓ | ✓ |
| Konzervativa / Conservative Dentistry / Konservierende Zahnheilkunde | ✓ | ✓ | ✓ |
| Popravka zuba / Tooth Decay Treatment / Zahnreparatur | ✓ | ✓ | ✓ |
| Ortodoncija / Orthodontics / Kieferorthopädie | ✓ | ✓ | ✓ |
| Mirko Trbović (Naš tim) | ✓ | ✓ | ✓ |
| Blog (Liste, Beiträge verlinken auf die Live-Site) | ✓ | ✓ | ✓ |
| Zakazivanje / Booking / Terminvereinbarung (Formular per mailto) | ✓ | ✓ | ✓ |
| Dental turizam (Foto-Galerie, 21 Bilder) | ✓ | ✓ | ✓ |
| Kontakt (Adresse, Telefone, Google-Maps-Link) | ✓ | ✓ | ✓ |
| Foto (Galerie Ordination, 10 Bilder, Lightbox) | ✓ | ✓ | ✓ |
| Korisni linkovi / Nützliche Links | ✓ | – | ✓ |
| Hitne intervencije (Dežurni stomatolog) / Notdienst | ✓ | – | ✓ |

Die Menüstruktur entspricht pro Sprache dem Original (das EN-Menü der Live-Site enthält z. B. keine Punkte für Zakazivanje/Notdienst/Linkovi). Die deutschen Inhalte sind Übersetzungen der serbischen Originaltexte.

## Design & Technik

- Eigene visuelle Identität: Petrol (`#0E3A3C`), Koralle (`#F1705F`) für CTAs, Mint-Flächen, kräftige Sans-Serif-Typografie; Original-Logo im Header petrol eingefärbt, im Footer weiß.
- Seitentypen: Startseite, Artikelseiten (mit Original-Titelbild als Banner und Fakten-Spalte), Galerien mit Lightbox, Blog-Liste, Terminformular, Kontaktseite.
- Animationen: Scroll-Reveals, Hero-Einblendsequenz, Testimonial-Laufband, Hover-Effekte; `prefers-reduced-motion` wird respektiert.
- Light-/Dark-Theme (token-basiert), responsive mit Off-Canvas-Menü.
- **Terminformular mit Direktversand:** Feldfragen erscheinen in der Mail immer auf Serbisch (Antworten in der vom Patienten gewählten Sprache, plus Zeile `Jezik stranice: DE/EN/SR`). Telefonfeld ist je Sprache mit Landesvorwahl vorbelegt (+381/+44/+49) und erzwingt eine internationale Nummer. Bot-Schutz: unsichtbares Honeypot-Feld + Zeitschranke (Absenden unter 4 s wird verworfen). Für den Direktversand ohne E-Mail-Programm einen kostenlosen Access-Key auf <https://web3forms.com> erstellen und in `index.html` bei `WEB3FORMS_KEY` eintragen; ohne Key (und im Fehlerfall) fällt das Formular automatisch auf den mailto-Versand zurück.
- **E-Mail-Adresse nicht scrapebar:** Die Praxis-Adresse steht nirgends im Klartext im Quellcode — sie ist Base64-kodiert und wird erst zur Laufzeit im Browser dekodiert (Footer-, Kontakt- und mailto-Links werden per JS erzeugt).

## Build

`index.html` wird aus Template + gescrapten Inhalten generiert (siehe Session-Verlauf). Direkt editierbar ist die Datei ebenfalls — Inhalte liegen als JSON-Datenblock am Anfang des `<script>`-Teils.
