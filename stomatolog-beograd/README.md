# Stomatolog Beograd — „Popravka zuba" Redesign

Modernes Redesign der Seite <https://www.stomatologbeograd.co.rs/popravka-zuba>.

## Inhalt

- `index.html` — komplette, in sich geschlossene Seite (alle Bilder als Data-URIs eingebettet). Einfach im Browser öffnen oder auf beliebigem Static-Host deployen.
- `images/` — die Original-Bilddateien (Logo, Titelbilder SR/EN, Sidebar-Banner) als Referenz.

## Features

- **Zweisprachig (SR/EN)** — Umschalter oben rechts, Auswahl wird in `localStorage` gespeichert. Navigation, Titelbild, Artikel, Sidebar und Footer wechseln komplett — 1:1 wie auf der Originalseite (die EN-Version hat dort z. B. keine Sidebar-Banner/Testimonials, das wurde übernommen).
- **Inhalte 1:1 übernommen** — alle Menüpunkte (inkl. Dropdowns), das Service-Icon-Menü, H1, sämtliche Absätze, Patientenstimmen, Banner („Zakažite online!", „Prijavite se!"), Footer (Kontakt, Adresse, Arbeitszeiten) und Copyright.
- **Modernes Design** — Sticky-Header in der Original-Markenfarbe (#505F6E), Aqua-Akzent, Serifen-Display-Typografie, Karten-Layout, Light-/Dark-Theme.
- **Animationen** — Ken-Burns-Effekt auf dem Titelbild, Scroll-Reveals, Hover-Effekte, animierter Sprachwechsel, animiertes Mobile-Menü. `prefers-reduced-motion` wird respektiert.
- **Responsive** — Off-Canvas-Menü und horizontal scrollbare Service-Chips auf Mobilgeräten.

Alle Links zeigen auf die bestehenden Seiten von stomatologbeograd.co.rs.
