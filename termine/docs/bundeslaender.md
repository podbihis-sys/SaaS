# Katalog nach Bundesland

Stand der Erfassung, Bundesland für Bundesland. Erfasst heißt: die Ämter sind
in der App auffindbar. Ob sie auch **überwacht** werden dürfen, ist eine zweite,
davon unabhängige Frage — siehe `scan_enabled`.

| Bundesland | Ämter | System | auffindbar | überwachbar | Grund |
| --- | ---: | --- | :---: | :---: | --- |
| **Bremen** | 17 | TEVIS (`termin.bremen.de`) | ✅ | ❌ | robots.txt `Disallow: /`, API zugangsgeschützt |
| **Berlin** | 2 | ZMS (`service.berlin.de`) | ❌ | ❌ | robots.txt sperrt `/terminvereinbarung/termin` und `/api`; API auf Anfrage |
| Nordrhein-Westfalen | 1 | TEVIS | ❌ | ❌ | dito |
| Schleswig-Holstein | 1 | netAppoint | ❌ | ❌ | dito |
| übrige 12 | 0 | – | – | – | noch nicht erfasst |

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
