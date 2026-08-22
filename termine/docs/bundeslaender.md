# Katalog nach Bundesland

Stand der Erfassung, Bundesland für Bundesland. Erfasst heißt: die Ämter sind
in der App auffindbar. Ob sie auch **überwacht** werden dürfen, ist eine zweite,
davon unabhängige Frage — siehe `scan_enabled`.

| Bundesland | Ämter | System | auffindbar | überwachbar | Grund |
| --- | ---: | --- | :---: | :---: | --- |
| **Bremen** | 17 | TEVIS (`termin.bremen.de`) | ✅ | ❌ | robots.txt `Disallow: /`, API zugangsgeschützt |
| Berlin | 2 | ZMS | ❌ | ❌ | Katalogeinträge noch nicht verifiziert |
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

## Nächste Bundesländer

Nach Größe wären Hamburg und das Saarland die nächsten. Vor dem Erfassen lohnt
in beiden Fällen dieselbe Reihenfolge wie bei Bremen: **zuerst robots.txt des
Buchungssystems**, dann erst der Katalog. Bremen hat gezeigt, dass ein
vollständiger Katalog wertlos für die Überwachung sein kann — und dass man das
in der ersten Minute erfährt, wenn man in der richtigen Reihenfolge nachsieht.
