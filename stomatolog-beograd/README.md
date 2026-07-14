# Stomatolog Beograd — „Popravka zuba" Redesign

Modernes Redesign der Seite <https://www.stomatologbeograd.co.rs/popravka-zuba>.

## Inhalt

- `index.html` — komplette, in sich geschlossene Seite (alle Bilder als Data-URIs eingebettet). Einfach im Browser öffnen oder auf beliebigem Static-Host deployen.
- `images/` — die Original-Bilddateien (Logo, Titelbilder SR/EN, Sidebar-Banner) als Referenz.

## Features

- **Dreisprachig (SR/EN/DE)** — Umschalter oben rechts, Auswahl wird in `localStorage` gespeichert. Navigation, Hero, Artikel, Sidebar, CTA-Band und Footer wechseln komplett. Die deutschen Texte sind Übersetzungen der serbischen Originalinhalte; die DE-Navigation verlinkt auf die englischen Unterseiten der Live-Site (deutsche existieren dort nicht).
- **Original-Inhalte übernommen** — alle Menüpunkte (inkl. Dropdowns), das Service-Icon-Menü, sämtliche Absätze, Patientenstimmen, Banner („Zakažite online!", „Prijavite se!"), Footer (Kontakt, Adresse, Arbeitszeiten) und Copyright.
- **Modernes, einladendes Design** — Split-Hero mit Foto, Live-Tagline, CTA-Buttons (Online-Termin + Telefon) und Trust-Leiste (seit 2002, Öffnungszeiten, Standort), Service-Chips, Karten-Layout, CTA-Band vor dem Footer, Sticky-Header in der Original-Markenfarbe (#505F6E), Aqua-Akzent, Light-/Dark-Theme.
- **Animationen** — Ken-Burns-Zoom auf dem Hero-Foto, schwebende Farb-Blobs, Scroll-Reveals, Hover-Effekte, animierter Sprachwechsel, animiertes Mobile-Menü. `prefers-reduced-motion` wird respektiert.
- **Responsive** — Off-Canvas-Menü und horizontal scrollbare Service-Chips auf Mobilgeräten.
- **Kein Framework** — reines HTML, CSS und Vanilla-JavaScript, kein Build-Schritt; läuft auf jedem normalen Webhosting.

Alle Links zeigen auf die bestehenden Seiten von stomatologbeograd.co.rs.
