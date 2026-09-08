# Abdeckung: alle Gemeinden Deutschlands

Grundlage ist das amtliche Gemeindeverzeichnis (GV100AD, Destatis, Gebietsstand
30.06.2026): **10 943 Gemeinden**, davon 10 747 mit Verwaltung, plus **294
Landkreise**. Jede einzelne wurde geprüft — nicht eine Auswahl großer Städte.

Jede Gemeinde landet in genau einem von drei Zuständen:

- **überwachbar** — die Ämter sind einzeln erfasst, robots.txt erlaubt das
  Abfragen, ein Adapter kann den Kalender lesen. Ein Suchauftrag kann auslösen.
- **verlinkt** — ein Terminsystem ist gefunden, aber nicht lesbar: kein Adapter
  für den Anbieter, oder robots.txt untersagt es. Die App führt zur richtigen
  Behörde und übergibt an deren Portal.
- **offen** — nichts gefunden. Website nicht auffindbar, kein Terminlink auf
  der Seite, oder die Gemeinde bietet keine Online-Terminvergabe an.

## Stand je Bundesland

| Bundesland | Gemeinden | überwachbar | verlinkt | Einwohner erreicht |
| --- | ---: | ---: | ---: | ---: |
| Baden-Württemberg | 1103 | 16 | 164 | 36 % |
| Bayern | 2217 | 29 | 588 | 44 % |
| Berlin | 1 | 0 | 1 | 100 % |
| Brandenburg | 413 | 16 | 32 | 30 % |
| Bremen | 2 | 0 | 1 | 17 % |
| Hamburg | 1 | 0 | 0 | 0 % |
| Hessen | 425 | 69 | 70 | 57 % |
| Mecklenburg-Vorpommern | 726 | 17 | 26 | 24 % |
| Niedersachsen | 964 | 38 | 121 | 42 % |
| Nordrhein-Westfalen | 396 | 97 | 111 | 60 % |
| Rheinland-Pfalz | 2301 | 28 | 105 | 33 % |
| Saarland | 53 | 4 | 12 | 57 % |
| Sachsen | 418 | 9 | 32 | 28 % |
| Sachsen-Anhalt | 218 | 6 | 30 | 32 % |
| Schleswig-Holstein | 1104 | 14 | 63 | 42 % |
| Thüringen | 601 | 11 | 14 | 30 % |
| **gesamt** | **10943** | **354** | **1370** | **46 %** |

Die Tabelle wird erzeugt, nicht gepflegt:
`python -m scripts.coverage_report --sniff sniff.jsonl --markdown`.

„Einwohner erreicht" zählt, wie viele Menschen in einer Gemeinde wohnen, für die
die App eine Terminbuchung nennen kann — überwacht oder verlinkt. Das ist der
ehrlichere Maßstab als die Zahl der Gemeinden: Bayerns 2 217 Gemeinden sind zu
großen Teilen Dörfer mit wenigen hundert Einwohnern.

**Im Katalog:** 1 199 einzeln erfasste, überwachbare Ämter in 360 Orten und
1 392 verlinkte Portale — zusammen 2 615 Einträge.

## Warum die Landkreise so viel zählen

Eine kreisangehörige Gemeinde meldet Einwohner an und traut, aber sie lässt
keine Autos zu, stellt keine Führerscheine aus und bearbeitet keine
Aufenthaltstitel — das macht ihr Landkreis. Für rund 8 000 Gemeinden hängen
diese drei Anliegen also an einer von 294 Kreisverwaltungen.

Deshalb wurden die Kreise separat vermessen. 75 von ihnen betreiben eine
TEVIS-Instanz, die aufgezählt werden konnte; ihre Ämter sind beim Kreissitz
eingetragen, und die Zuständigkeitsabfrage findet sie von jeder Gemeinde des
Kreises aus. Wer in Bad Langensalza eine Kfz-Zulassung sucht, bekommt die des
Unstrut-Hainich-Kreises — überwachbar.

21 Kreise haben eine Website unter einem Namen, den kein Muster trifft
(`rbk-direkt.de` für den Rheinisch-Bergischen Kreis, `mkk.de` für den
Main-Kinzig-Kreis). Sie sind die verbliebene Lücke auf Kreisebene.

## Wie die Vermessung läuft

Vier Skripte, in dieser Reihenfolge:

1. **`scripts/register_cities.py`** — erzeugt die Arbeitsliste aus dem amtlichen
   Verzeichnis. Nicht aus einer handgepflegten Städteliste, die die Hälfte des
   Landes stillschweigend auslässt.
2. **`scripts/fetch_official_sites.py`** — holt die amtliche Website jeder
   Gemeinde, über den Gemeindeschlüssel, in einer Abfrage. Ohne diesen Schritt
   blieben 4 156 Gemeinden „Website nicht gefunden": ihre Domain heißt eben
   nicht `www.<name>.de`.
3. **`scripts/sniff_portals.py`** — liest die Startseite der Gemeinde, folgt bei
   Bedarf bis zu drei Links Richtung „Bürgerservice"/„Termin", nimmt die Links,
   die auf ein Terminsystem zeigen, erkennt bei unbekannten Hosts den Anbieter
   an dessen eigener Seite und prüft die robots.txt des Ziels. Etwa zwei bis
   vier Anfragen je Gemeinde — das ist der Grund, warum eine Vermessung des
   ganzen Landes vertretbar ist.
4. **`scripts/discover_tevis.py`** + **`build_tevis_catalog.py`** /
   **`build_portal_catalog.py`** — zählen die Mandanten jeder TEVIS-Instanz auf
   und schreiben die beiden Katalogdateien.

Das ältere `scripts/survey_cities.py` rät Hostnamen (`termine.<stadt>.de`). Das
funktioniert für Großstädte und für sonst niemanden; es bleibt als Ergänzung
erhalten, die Hauptquelle ist der Weg über die Gemeinde-Website.

## Gefundene Anbieter

| Anbieter | Kommunen | Adapter |
| --- | ---: | --- |
| TEVIS | 1053 | **ja**, live verifiziert |
| Terminland | 198 | nein |
| termin-online-buchen | 111 | nein |
| eTermin | 94 | ja (API-Schlüssel nötig) |
| nolis | 94 | nein |
| Tempus | 63 | nein |
| smartCJM | 50 | nein |
| cleverQ | 43 | nein |
| meinenTermin | 21 | nein |
| timify | 21 | nein |
| ZMS (Berlin) | 15 | ja (gesperrt, siehe unten) |
| qmatic | 13 | nein |
| DTMS | 1 | nein |

TEVIS ist mit Abstand der Marktführer, und der Adapter dafür ist gegen zehn
Instanzen live geprüft (siehe [`providers.md`](./providers.md)). Der nächste
Adapter, der sich lohnt, ist Terminland, danach termin-online-buchen — zusammen
rund 300 weitere Kommunen.

## Was noch offen ist

| Ergebnis | Gemeinden | Was das heißt |
| --- | ---: | --- |
| kein Terminsystem verlinkt | 4130 | Website erreichbar, aber kein Link auf ein Buchungssystem gefunden. Viele kleine Gemeinden haben keins; manche verstecken es tiefer als zwei Klicks oder bauen die Navigation per JavaScript. |
| Website nicht gefunden | 4812 | Weder die amtliche Adresse noch die geratenen Namen antworteten. Betrifft fast nur sehr kleine Gemeinden, die oft von ihrer Verbandsgemeinde mitverwaltet werden. |
| Website blockiert (403) | 21 | Die Seite existiert und weist unseren Client ab. Wir tarnen ihn nicht. |

Der Weg für die erste Gruppe: die Verbandsgemeinden, Samtgemeinden und Ämter
(4 583 im Register verzeichnet) als eigene Ebene vermessen. Für die zweite: die
Verwaltungsadresse aus dem Verband statt aus der Gemeinde ableiten.

## Bremen — vollständig erfasst, gesperrt

Zwei Kommunen: Bremen und Bremerhaven. `service.bremen.de` führt zwei kuratierte
Listen — alle Behörden mit Terminbuchung und alle buchbaren Dienstleistungen —
und erlaubt deren Auslesen. `scripts/discover_bremen.py` erzeugt daraus
`app/catalog/bremen.py`: **17 Behörden, 72 Dienstleistungen**, alle auf einer
TEVIS-Instanz unter `termin.bremen.de/termine`.

Überwacht wird trotzdem nichts, aus zwei unabhängigen Gründen:

1. `termin.bremen.de/robots.txt` enthält `User-agent: *` / `Disallow: /`.
2. Die Instanz hat eine API (`/termine/api`, mit Swagger-UI), die ohne
   Zugangsdaten mit `{"status": 0, "message": "Zutritt verweigert!"}` antwortet.

Der Adapter wäre fertig, die Mandanten-Ids sind erfasst. Was fehlt, ist die
Erlaubnis. Sobald Bremen sie erteilt, ist es ein Flag pro Zeile.

## Berlin — gesperrt, aber mit klarer Ansage

`service.berlin.de/robots.txt` ist ungewöhnlich ausführlich: ein Kommentarblock
mit Nutzungsbedingungen, dann die Regeln. Entscheidend sind zwei Zeilen:

```
Disallow: /terminvereinbarung/api
Disallow: /terminvereinbarung/termin
```

Der Buchungsablauf, den der ZMS-Adapter nutzt, ist ausdrücklich untersagt.
Zugleich steht im Kommentar wörtlich: *„Please contact us, if you need access to
the API under /terminvereinbarung/api"* — Kontakt `webmaster@berlinonline.net`.
Berlin sagt damit dasselbe wie Bremen, nur deutlicher: **es gibt eine API, fragt
uns.**

Die Katalogseiten (`/standort/…`, `/dienstleistung/…`) sind erlaubt. Ein
Berliner Katalog ließe sich wie in Bremen aus den öffentlichen Listen bauen —
auffindbar und direkt buchbar, nicht überwacht.

## Was „verlinkt, nicht überwacht" praktisch heißt

`Office.scan_enabled` trennt die beiden Berechtigungen:

- **auffindbar** (`active`) — das Amt erscheint in Suche und Zuständigkeitsliste,
  mit Adresse und Buchungslink. Ein Nutzer findet das richtige Amt und kommt mit
  einem Tipp ins offizielle Portal.
- **überwachbar** (`scan_enabled`) — der Scanner darf abfragen. Ist das aus, wird
  nie gepollt, und ein Suchauftrag darauf wird beim Anlegen mit Begründung
  abgelehnt, statt still nie auszulösen.

Bremen ist damit kein toter Eintrag: die App hilft beim Finden und Buchen, nur
das automatische Beobachten fehlt.

## Fehler, die diese Vermessung selbst aufgedeckt hat

- Der erste Survey-Lauf prüfte den **HTTP-Status der Startseite nicht** und
  schloss „TEVIS" allein aus dem Hostnamen. Fünf Städte standen dadurch in der
  Spalte „geht", obwohl ihre Startseite 403 lieferte.
- Ein **503 bei robots.txt** wurde als „keine Datei → erlaubt" gelesen. RFC 9309
  sagt das Gegenteil. Der Survey wurde korrigiert — und Wochen später fiel auf,
  dass der *Produktions-Matcher* denselben Fehler machte, also die Stelle, an der
  es zählt. Auch behoben, mit Tests.
- Das **Ratsinformationssystem** jeder Kommune (`ris.`, `sitzungsdienst.`)
  heißt „Termine" und ist keins. Es galt eine Weile als Fund.
- Ein einzelner Fehler in einem von 10 747 Durchläufen riss den ganzen Lauf ab,
  weil eine Ausnahme aus `asyncio.as_completed` den gemeinsamen HTTP-Client
  schloss. Seitdem ist jeder Durchlauf für sich gekapselt.
