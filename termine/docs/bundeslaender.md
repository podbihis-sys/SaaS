# Katalog nach Bundesland

Stand der Erfassung, Bundesland für Bundesland. Erfasst heißt: die Ämter sind
in der App auffindbar. Ob sie auch **überwacht** werden dürfen, ist eine zweite,
davon unabhängige Frage — siehe `scan_enabled`.

| Bundesland | Ämter | System | auffindbar | überwachbar | Stand |
| --- | ---: | --- | :---: | :---: | --- |
| **Nordrhein-Westfalen** | 32 | TEVIS (Düsseldorf, Münster, Mönchengladbach, Duisburg) | ✅ | ⏳ | robots.txt erlaubt; Adapter noch nicht live verifiziert |
| **Bremen** | 17 | TEVIS (`termin.bremen.de`) | ✅ | ❌ | robots.txt `Disallow: /`, API zugangsgeschützt |
| **Bayern** | 10 | TEVIS (Nürnberg) | ✅ | ⏳ | wie NRW |
| **Baden-Württemberg** | 9 | TEVIS (Heidelberg) | ✅ | ⏳ | wie NRW |
| **Hessen** | 7 | TEVIS/ekom21 (Frankfurt, `/fra/`) | ✅ | ⏳ | wie NRW |
| **Niedersachsen** | 2 | TEVIS (Oldenburg) | ✅ | ⏳ | wie NRW |
| **Berlin** | 2 | ZMS (`service.berlin.de`) | ❌ | ❌ | robots.txt sperrt `/terminvereinbarung/termin` und `/api`; API auf Anfrage |
| Schleswig-Holstein | 1 | netAppoint (Kiel) | ❌ | ❌ | Alteintrag, unverifiziert |
| übrige 8 | 0 | – | – | – | noch nicht erfasst |

⏳ = Erlaubnis liegt vor (robots.txt), Freischaltung wartet auf die erste
Live-Verifikation des Adapters; bis dahin bleibt `SCANNER_PROVIDERS` ohne `tevis`.

## Bremen — vollständig erfasst

Das kleinste Bundesland, und damit das erste. Zwei Kommunen: Bremen und
Bremerhaven.

**Woher die Daten kommen.** `service.bremen.de` führt zwei kuratierte Listen —
alle Behörden mit Terminbuchung und alle buchbaren Dienstleistungen. Die
robots.txt dieses Portals ist leer, das Auslesen also erlaubt.
`scripts/discover_bremen.py` holt beide Listen mit je einer Anfrage und erzeugt
`app/catalog/bremen.py`. Erneut ausführen genügt, um den Katalog zu
aktualisieren.

**Ergebnis:** 17 Behörden, 72 Dienstleistungen. Alle 17 hängen an *einer*
TEVIS-Instanz unter `termin.bremen.de/termine`, unterschieden durch den
Mandanten-Parameter `md` (Werte 2, 4, 5, 6, 13, 16, 23, 25, 41, 55, 59, 60, 63,
75, 80). Darunter die drei BürgerServiceCenter, die Fahrerlaubnisstelle, das
Finanzamt, das Gesundheitsamt und die Gewerbemeldestelle.

**Warum trotzdem nicht überwacht wird.** Zwei unabhängige Gründe:

1. `termin.bremen.de/robots.txt` enthält `User-agent: *` / `Disallow: /` — ein
   Verbot für die gesamte Domain, für jeden automatisierten Client.
2. Die Instanz hat zwar eine API (`/termine/api`, mit Swagger-UI), diese
   antwortet ohne Zugangsdaten aber mit `{"status": 0, "message": "Zutritt
   verweigert!"}`.

Der Adapter wäre fertig, die Mandanten-Ids sind erfasst. Was fehlt, ist die
Erlaubnis. Sobald Bremen sie erteilt, ist es ein Flag pro Zeile.

**Bremerhaven** ist als zweite Kommune separat geprüft: `www.bremerhaven.de`
setzt ebenfalls `Disallow: /`, ein eigener Terminhost war unter den üblichen
Namen nicht erreichbar. Ebenfalls nicht überwachbar.

## Berlin — geprüft, ebenfalls gesperrt, aber mit klarer Ansage

`service.berlin.de/robots.txt` ist ungewöhnlich ausführlich: ein Kommentarblock
mit Nutzungsbedingungen, dann die Regeln. Entscheidend sind zwei Zeilen:

```
Disallow: /terminvereinbarung/api
Disallow: /terminvereinbarung/termin
```

Der Buchungsablauf, den der ZMS-Adapter nutzt, ist also ausdrücklich
untersagt. Zugleich steht im Kommentar wörtlich: *„Please contact us, if you
need access to the API under /terminvereinbarung/api"* — Kontakt
`webmaster@berlinonline.net`. Berlin sagt damit dasselbe wie Bremen, nur
deutlicher: **es gibt eine API, fragt uns.**

Die Katalogseiten (`/standort/…`, `/dienstleistung/…`) sind erlaubt. Ein
Berliner Katalog ließe sich also wie in Bremen aus den öffentlichen Listen
bauen — auffindbar und direkt buchbar, nicht überwacht.

**Ein Parser-Bug, den Berlin aufgedeckt hat.** Die Datei nutzt Platzhalter
(`Disallow: /standort/*/pdf/`). Pythons `RobotFileParser` kennt keine
Platzhalter und vergleicht wörtlich — die Regel traf nie, und die Datei las
sich *freizügiger*, als sie ist. Das ist die gefährliche Richtung.
`app/providers/robots.py` bringt deshalb einen eigenen Matcher mit
(`*`, `$`, längste Regel gewinnt, Allow schlägt Disallow bei Gleichstand),
getestet gegen die wörtliche Berliner Datei.

## Kurz geprüft: Hamburg, Saarland

- **Hamburg:** `www.hamburg.de` und `serviceportal.hamburg.de` sperren nur
  einzelne Pfade (Branchenbuch, Gateway-Login). Der eigentliche Terminhost ist
  noch nicht identifiziert; erst dessen robots.txt entscheidet.
- **Saarland:** `www.saarland.de` antwortet mit 403, ein Terminhost war unter
  den naheliegenden Namen nicht erreichbar. Offen.

## Die 50 größten Städte — Vermessung

Reproduzierbar mit drei Skripten, in dieser Reihenfolge:

1. `scripts/survey_cities.py` — probiert je Stadt Kandidaten-Hosts, erkennt den
   Anbieter, liest die **gesamte** robots.txt des Buchungshosts.
2. `scripts/discover_tevis.py` — für bestätigte TEVIS-Hosts mit erlaubter
   robots.txt: liest die Startseite und zieht jeden `select2?md=`-Mandanten
   samt Amtsname heraus (auch aus `<button onclick>`-Markup, wie Düsseldorf es
   rendert).
3. `scripts/build_tevis_catalog.py` — prüft je Instanz zusätzlich robots.txt für
   `/suggest`, den Kalenderpfad, den der Adapter tatsächlich abfragt, und
   erzeugt `app/catalog/tevis_cities.py`.

### Geht — 60 Ämter in 8 Städten im Katalog

| Stadt | Host | Ämter |
| --- | --- | ---: |
| Mönchengladbach | `termine.moenchengladbach.de` | 14 |
| Nürnberg | `terminvereinbarung.nuernberg.de` | 10 |
| Düsseldorf | `termine.duesseldorf.de` | 9 |
| Heidelberg | `termin.heidelberg.de` | 9 |
| Münster | `termine.stadt-muenster.de` | 8 |
| Frankfurt am Main | `tevis.ekom21.de/fra/` | 7 |
| Oldenburg | `terminvereinbarung.oldenburg.de` | 2 |
| Duisburg | `termine.duisburg.de` | 1 (Ausländerbehörde) |

Alle: TEVIS, robots.txt erlaubt `/select2` **und** `/suggest`, Mandanten-Ids
und Amtsnamen erfasst, `scan_enabled=True`. Adressen fehlen — die
TEVIS-Startseite nennt Ämter, aber keine Straßen; die App findet sie über
Stadt und Name. **Noch nicht live verifiziert:** kein Adapter ist bisher gegen
eine dieser Instanzen gelaufen. Das ist der nächste Schritt und die
Voraussetzung, `tevis` in `SCANNER_PROVIDERS` aufzunehmen.

### Geht nach Freigabe — 2

| Stadt | System | Lage |
| --- | --- | --- |
| Bremen | TEVIS | `Disallow: /`; API vorhanden, zugangsgeschützt |
| Berlin | ZMS | `/terminvereinbarung/termin` gesperrt; API auf Anfrage (`webmaster@berlinonline.net`) |

### Geht nicht — 3

| Stadt | Grund |
| --- | --- |
| Stuttgart | `service.stuttgart.de`: `Disallow: /` |
| Bochum | smartCJM — kein Adapter |
| Halle (Saale) | smartCJM — kein Adapter |

### Unklar — Terminhost gefunden, mehr nicht — 8

| Stadt | Host | Was fehlt |
| --- | --- | --- |
| Köln | `termine.stadt-koeln.de` | antwortet 400 ohne gültigen Mandanten; Anbieter nicht bestätigbar (Alteintrag sagt TEVIS) |
| Dortmund | `termine.dortmund.de` | Anbieter unbekannt |
| Essen | `termine.essen.de` | Anbieter unbekannt |
| Bonn | `termine.bonn.de` | Anbieter unbekannt |
| Erfurt | `termin.erfurt.de` | Anbieter unbekannt; robots.txt 403 |
| Braunschweig | `termine.braunschweig.de` | TEVIS bestätigt, aber keine Mandanten-Links auf der Startseite |
| Kassel | `tevis.ekom21.de` | TEVIS vermutet (Hostname); Root antwortet 403 |
| Darmstadt | `www.darmstadt.de` | Hauptseite verweist auf TEVIS/ekom21; Instanz nicht direkt erreichbar |

**ekom21 (Hessen).** Die geteilte Instanz `tevis.ekom21.de` verweigert ihren
Root (403) und antwortet auf geratene Präfixe mit 404 — `/wi/`, `/ks/`, `/da/`
existieren nicht. Der Einstieg muss aus dem Stadtportal kommen: Frankfurts
`/fra/` kam so und lieferte sofort 7 Mandanten. Wiesbaden, Kassel und
Darmstadt brauchen dasselbe — je eine URL aus ihrem Portal, dann ist es eine
Zeile in `EKOM21_LANDINGS`.

### Kein Terminhost gefunden — 29

Hamburg, München, Leipzig, Dresden, Hannover, Wuppertal, Bielefeld, Mannheim,
Karlsruhe, Augsburg, Gelsenkirchen, Aachen, Chemnitz, Kiel, Magdeburg,
Freiburg, Krefeld, Mainz, Lübeck, Wiesbaden, Oberhausen, Rostock, Hagen,
Potsdam, Saarbrücken, Hamm, Ludwigshafen, Osnabrück, Leverkusen.

Das heißt: keiner der Kandidaten-Hosts (`termine.`, `termin.`, `tevis.`,
`terminvereinbarung.`, `buergerservice.`, `<stadt>.tevis-online.de`) hat
geantwortet; nur die Stadt-Hauptseite war erreichbar. Diese Städte **haben**
Terminsysteme — sie liegen nur unter Namen, die kein Muster trifft, oder
hinter dem Stadtportal. Der Weg dorthin ist derselbe wie bei Bremen: die
Terminseite des Stadtportals lesen und den Link folgen. Das ist Handarbeit,
je Stadt wenige Minuten.

### Zwei Fehler, die diese Vermessung selbst aufgedeckt hat

- Der erste Survey-Lauf prüfte den **HTTP-Status der Startseite nicht** und
  schloss „TEVIS" allein aus dem Hostnamen. Fünf Städte standen dadurch in der
  Spalte „geht" (ekom21 ×4, Lübeck), obwohl ihre Startseite 403 lieferte.
  Behoben: ein abgewiesener Root gilt als „unbestätigt", nie als erkannt.
- Ein 503 bei robots.txt wurde als „keine Datei → erlaubt" gelesen. RFC 9309
  sagt das Gegenteil: Serverfehler → vorerst gesperrt. Behoben.

## Was „auffindbar, nicht überwachbar" praktisch heißt

`Office.scan_enabled` trennt die beiden Berechtigungen:

- **auffindbar** (`active`) — das Amt erscheint in Suche und Katalog, mit
  Adresse, Dienstleistungen und Buchungslink. Ein Nutzer findet das richtige
  Amt und kommt mit einem Tipp ins offizielle Portal.
- **überwachbar** (`scan_enabled`) — der Scanner darf abfragen. Ist das aus,
  wird das Amt nie gepollt, und ein Suchauftrag darauf wird beim Anlegen mit
  Begründung abgelehnt, statt still nie auszulösen.

Bremen ist damit kein toter Eintrag: die App hilft beim Finden und Buchen, nur
das automatische Beobachten fehlt.

## Die Regel ist im Code verankert, nicht im Gedächtnis

`app/providers/robots.py` liest und cacht robots.txt pro Host; `scan_pair`
fragt **vor jedem** Scan. Sagt eine Behörde nein, wird der Scan abgebrochen,
das Amt auf `scan_enabled=False` gesetzt und der Grund gespeichert. Das gilt
auch für Ämter, die im Katalog als erlaubt geführt sind — eine Behörde kann ihr
robots.txt jederzeit ändern, und der Katalog ist immer nur so frisch wie der
letzte Mensch, der hingesehen hat.

## Der Weg zur Freigabe

Für Bremen — und für jede Behörde mit derselben Lage:

1. Behörde anschreiben, Zweck erklären, Abfragefrequenz nennen (der Scanner
   fragt nur, was jemand tatsächlich sucht, und hält Mindestabstände ein).
2. Um Zugang zur bestehenden TEVIS-API bitten. Sie existiert bereits — das ist
   der saubere Weg und deutlich schonender als Scraping.
3. Bei Zusage: `scan_enabled=True` setzen, den Adapter einmal live verifizieren
   (siehe `providers.md`), `SCANNER_PROVIDERS` um `tevis` erweitern.

## Was Bremen und Berlin gemeinsam lehren

Beide großen geprüften Systeme sperren den Buchungspfad und verweisen auf eine
API, um die man bitten soll. Der Weg zu echter Überwachung führt also nicht
über bessere Scraper, sondern über **eine Anfrage an die Behörde** — und die
ist der eine Schritt, den kein Code ersetzen kann. Adapter und Katalog stehen
bereit; sobald ein Zugang erteilt ist, ist die Freischaltung ein Flag.

Für jedes weitere Bundesland gilt die Reihenfolge, die Bremen erzwungen und
Berlin bestätigt hat: **zuerst die vollständige robots.txt des Buchungshosts**
lesen — nicht die ersten Zeilen, die ganze Datei —, dann erst den Katalog
bauen. Bei Berlin stand die entscheidende Sperre in Zeile sieben.
