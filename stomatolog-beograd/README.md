# Stomatolog Beograd — „Popravka zuba" Redesign

Eigenständiges Redesign der Seite <https://www.stomatologbeograd.co.rs/popravka-zuba>.

Vom Original übernommen wurden ausschließlich: **Logo, Bilder, Texte, Verlinkungen und die Menüstruktur**. Das Design selbst ist komplett neu und unabhängig vom alten Auftritt.

## Inhalt

- `index.html` — komplette, in sich geschlossene Seite (alle Bilder als Data-URIs eingebettet). Einfach im Browser öffnen oder auf beliebigem Static-Host / normalem Webhosting deployen.
- `images/` — die Original-Bilddateien (Logo, Fotos, Banner) als Referenz.

## Design

- **Eigene visuelle Identität** — Petrol-Grün (`#0E3A3C`) als Grundfarbe, Koralle (`#F1705F`) für Call-to-Actions, Mint-Flächen, kräftige Sans-Serif-Typografie. Bewusst losgelöst von der Optik der alten Website; das Original-Logo wird für den hellen Header in Petrol eingefärbt, im Footer in Weiß verwendet.
- **Neue Seitenstruktur** — heller Sticky-Header mit Pill-Navigation und Termin-Button, Hero mit Foto-Karte und animiert gezeichneter Unterstreichung, Leistungs-Kachelgrid, Artikel-Karte mit Fakten-Spalte und Pull-Quote, Promo-Karten, Testimonial-Marquee, großes CTA-Panel, Petrol-Footer.
- **Dreisprachig (SR/EN/DE)** — Umschalter im Header, Auswahl wird in `localStorage` gespeichert. Sämtliche Inhalte wechseln. Die deutschen Texte sind Übersetzungen der serbischen Originalinhalte; die DE-Navigation verlinkt auf die englischen Unterseiten der Live-Site (deutsche existieren dort nicht).
- **Animationen** — Einblend-Sequenz im Hero, gezeichnete Unterstreichung, Scroll-Reveals, schwebende Badges, Testimonial-Laufband (pausiert bei Hover), Hover-Effekte, animierter Sprachwechsel. `prefers-reduced-motion` wird respektiert.
- **Light-/Dark-Theme** — token-basiert, folgt der Systemeinstellung.
- **Responsive** — Off-Canvas-Menü, umbrechende Grids.
- **Kein Framework** — reines HTML, CSS und Vanilla-JavaScript, kein Build-Schritt; läuft auf jedem normalen Webhosting.

Alle Links zeigen auf die bestehenden Seiten von stomatologbeograd.co.rs.
