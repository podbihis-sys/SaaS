# Postleitzahl oder Ort → zuständige Behörde

Wer „51519" oder „Overath" eintippt, will beim richtigen Amt landen — nicht bei
einer Trefferliste, in der das eigene Rathaus fehlt, weil es Kfz-Zulassungen gar
nicht macht. Dieses Dokument beschreibt, woher die App weiß, welche Gemeinde
gemeint ist und wer dort für was zuständig ist.

## Datenquellen

| Was | Quelle | Umfang | Lizenz |
|---|---|---|---|
| Alle Gemeinden Deutschlands: Amtlicher Gemeindeschlüssel (AGS), Name, Art (kreisfrei / kreisangehörig / …), Einwohner, Kreis mit Sitz, Land, PLZ des Verwaltungssitzes | **GV100AD**, Statistisches Bundesamt (Destatis), Quartalsauszug aus GV-ISys | 10 943 Gemeinden, 401 Kreise, 16 Länder — Gebietsstand 30.06.2026 | „Vervielfältigung und Verbreitung, auch auszugsweise, mit Quellenangabe gestattet" |
| Übrige Postleitzahlen → Gemeinde (Städte haben viele PLZ; eine ländliche PLZ deckt oft Dörfer zweier Gemeinden ab) | **OpenPLZ API** (openplzapi.org, Open Data; Quellen OSM und Destatis) | je PLZ **einmal** abgefragt, dann gespeichert | Open Data |

Das von Ihnen verlinkte PDF (`beschreibung-gebietseinheiten.pdf`) ist die
Methodenbeschreibung zu GV-ISys — es erklärt, welche Felder das Verzeichnis
führt (AGS, Regionalschlüssel, PLZ des Verwaltungssitzes, Gerichts-, Finanzamts-
und Arbeitsagenturbezirke …), enthält aber selbst keine Gemeindeliste. Die Liste
ist der GV100AD-Auszug, der auf derselben Destatis-Seite als Quartalsdatei
liegt. Genau der ist importiert.

Der Importer: `python -m scripts.import_gv100ad` lädt den aktuellen Quartalsauszug
(robots.txt von destatis.de erlaubt `/DE/`), parst die Festformat-Datei und
schreibt `app/data/gv100ad.json` (860 KB). `scripts.seed` lädt diese Datei in die
Tabelle `municipalities` und trägt die Sitz-PLZ in `postal_codes` ein. Ein neues
Quartal ist also: Importer laufen lassen, Seed laufen lassen.

## Auflösung

`GET /api/v1/places?q=…`

- **Fünf Ziffern** → Postleitzahl. Zuerst wird die PLZ einmalig über OpenPLZ
  vervollständigt (Tabelle `postal_code_lookups` merkt sich, dass das passiert
  ist — auch bei „gibt es nicht"), dann kommen alle Gemeinden zurück, in die
  diese PLZ hineinreicht, größte zuerst, jeweils mit den Ortsteilen. Ist OpenPLZ
  nicht erreichbar, antwortet das Register allein (Sitz-PLZ); ein Ausfall wird
  nicht als „PLZ existiert nicht" gemerkt.
- **Sonst** → Ortsname, Präfixsuche über den Kurznamen („Kiel" statt „Kiel,
  Landeshauptstadt"), sortiert nach Einwohnern: „Münster" liefert zuerst die
  Stadt in Nordrhein-Westfalen, dann Münster (Hessen), dann das Dorf in Bayern.
  Findet das Präfix nichts, wird im Namen gesucht („Gladbach").

`GET /api/v1/places/{ags}`

Für jede Behördenart: **wer zuständig ist** und welche Ämter des Katalogs dazu
gehören.

| Gemeindeart | Bürgeramt, Standesamt, Gewerbeamt | Kfz-Zulassung, Führerschein, Ausländerbehörde | Jobcenter, Finanzamt |
|---|---|---|---|
| Kreisfreie Stadt / Stadtkreis (Textkennzeichen 61, 62) | Stadt | Stadt | eigener Bezirk |
| Kreisangehörige Gemeinde / Stadt / Markt / Große Kreisstadt (60, 63, 64, 67) | Gemeinde | **Kreis** (Sitz wird genannt); hat die Stadt eine eigene Stelle im Katalog, wird die bevorzugt | eigener Bezirk |

Für Große Kreisstädte und Städte (63, 67) steht ein Hinweis dabei, dass größere
kreisangehörige Städte teils eigene Zulassungs- oder Ausländerstellen führen —
das Landesrecht ist hier uneinheitlich (NRW: mittlere/große kreisangehörige
Städte; Baden-Württemberg: Große Kreisstädte als untere Verwaltungsbehörde).

Jobcenter- und Finanzamtsbezirke sind in GV-ISys enthalten, aber noch nicht
importiert; die App nennt die Behördenart und sucht Ämter im Kreis.

## Verknüpfung der Ämter

Jedes Amt im Katalog trägt `municipality_ags`. Der Seeder setzt ihn aus
`city` + `state`: exakter Kurzname, dann Land, dann Einwohnerzahl. Was das
Register anders qualifiziert als der Alltag („Oldenburg (Oldb)", „Halle
(Saale)"), wird in einem zweiten Durchgang über den Namen vor der Klammer
gefunden. Nicht zuordenbare Ämter werden im Seed-Log genannt statt still
übergangen — derzeit nur die drei Demo-Ämter in „Musterstadt".

Bei den Kreisen gilt: Ein Landratsamt sitzt in der Kreisstadt und hängt an
deren AGS. Die Kreis-Zuständigkeit sucht deshalb Ämter der passenden Art in
allen Gemeinden des Kreises.

## Vom Ort zum Terminportal

Die Zuständigkeit allein hilft nicht, wenn zur zuständigen Behörde kein Eintrag
existiert. Deshalb ist jede Kommune, deren Website auf ein Terminsystem
verweist, als Amt im Katalog — mit dem offiziellen Buchungslink, aber ohne
Überwachung (`provider = portal`, `scan_enabled = False`). Woher diese Einträge
kommen und wie viele es sind, steht in
[`bundeslaender.md`](./bundeslaender.md).

Findet die Zuständigkeitsabfrage für ein Anliegen kein passendes Amt, bietet sie
das allgemeine Portal an — das der Gemeinde für gemeindliche Anliegen, das des
Kreises für Kfz, Führerschein und Ausländerangelegenheiten. Nie das der
Nachbarstadt: deren Bürgerbüro erledigt für Auswärtige nichts.

## In der App

Suche → Eingabe „Stadt oder PLZ" → Vorschläge aus dem Register (ab zwei
Zeichen). Ein Tipp öffnet die Zuständigkeitsansicht: „Direkt buchbar" (Ämter
im Katalog, mit „überwachbar" / „nur Portal") und „Zuständig, noch nicht im
Katalog" (Behörde wird genannt, damit man dort direkt bucht).

## Grenzen

- Die Sitz-PLZ deckt ~7 000 Gemeinden mit genau einer PLZ exakt ab; alles andere
  hängt an OpenPLZ. Fällt der Dienst dauerhaft weg, wäre ein Offline-Import
  (z. B. das PLZ-Verzeichnis von OpenPLZ als CSV) der nächste Schritt.
- Verbandsgemeinden (RLP), Ämter (SH/MV/BB) und Samtgemeinden (NI) erledigen
  das Meldewesen ihrer Mitgliedsgemeinden zentral. Der Verbandsschlüssel steht im
  Register (`verband`), wird aber noch nicht für die Zuständigkeit ausgewertet.
- Koordinaten der Gemeinden sind nicht im Register; die Umkreissuche läuft
  weiterhin über die Koordinaten der Ämter.
