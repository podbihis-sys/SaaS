# Rechtliche und ethische Leitplanken

*Dieses Dokument beschreibt die Entwurfsentscheidungen. Es ist keine
Rechtsberatung. Vor einem öffentlichen Betrieb sollte eine Anwältin oder ein
Anwalt für IT- und Datenschutzrecht darauf schauen.*

## Warum das hier ganz vorne steht

Eine App, die deutsche Ämter automatisiert abfragt, bewegt sich in einem Feld,
in dem technisch Mögliches und rechtlich Zulässiges deutlich auseinanderfallen.
Die Architektur des Projekts ist an mehreren Stellen bewusst *unbequemer*, als
sie sein müsste — weil die bequeme Variante die App angreifbar machen würde.

## Die vier Grundregeln

### 1. Keine automatische Buchung

Die App bucht **keine** Termine. Sie erzeugt einen möglichst tiefen Link in das
offizielle Portal und übergibt dort an den Nutzer.

Gründe:

- **Nutzungsbedingungen.** Praktisch alle Terminportale untersagen die
  automatisierte Buchung ausdrücklich.
- **Personenbezogene Daten.** Eine automatische Buchung würde bedeuten, Name,
  Geburtsdatum und Ausweisnummern zu speichern und weiterzugeben. Diese Daten
  gar nicht erst zu erheben, ist der wirksamste Datenschutz.
- **CAPTCHAs.** Der letzte Schritt ist fast überall durch ein CAPTCHA
  geschützt. Es zu umgehen wäre eine bewusste Umgehung einer technischen
  Schutzmaßnahme.
- **Fairness.** Ein Bot, der schneller bucht als ein Mensch, verschiebt
  knappe Termine zugunsten derer, die die App kennen. Benachrichtigen ist
  Chancengleichheit, automatisch buchen ist Vordrängeln.

Umgesetzt in `app/api/v1/bookings.py` und `AppointmentProvider.booking_url`.

### 2. Nur abfragen, was jemand wirklich braucht

Der Scanner fragt ausschließlich Amt/Anliegen-Paare ab, für die ein aktiver
Suchauftrag existiert (`due_pairs` in `app/services/scanner.py`). Ohne Nutzer
gibt es keine Last. Die Anfragefrequenz wächst mit der Nachfrage, nicht mit der
Größe des Katalogs.

### 3. Höflicher Client

- Ein aussagekräftiger `User-Agent` mit Kontaktmöglichkeit
  (`HTTP_USER_AGENT`) — kein Verstecken als Browser.
- Mindestabstand zwischen zwei Anfragen an denselben Host, pro Adapter
  definiert (`min_request_interval`, bei Berlin 5 Sekunden).
- Mindestabstand zwischen zwei Scans desselben Paares
  (`min_scan_interval_seconds`, zusätzlich global durch
  `SCANNER_MIN_INTERVAL_SECONDS` begrenzt).
- Automatischer Rückzug: nach `SCANNER_FAILURE_THRESHOLD` Fehlern in Folge
  pausiert das Amt für `SCANNER_COOLDOWN_SECONDS`.
- Adapter sind per `SCANNER_PROVIDERS` einzeln freizuschalten. Voreinstellung
  ist `demo` — ein rein synthetischer Anbieter, der kein echtes Amt kontaktiert.

### 4. Datensparsamkeit

- Kein Konto, keine E-Mail-Adresse, kein Name. Ein Gerät erzeugt beim ersten
  Start eine Zufallskennung; daran hängen die Suchaufträge.
- Der Standort wird nur als Suchradius an die API geschickt und nicht
  gespeichert.
- Push-Token liegen in der Datenbank, weil ohne sie keine Benachrichtigung
  möglich ist; sie werden gelöscht, sobald Expo sie als ungültig meldet.
- „Alle Daten löschen“ in den Einstellungen verwirft die Kennung auf dem Gerät.

## Offene Punkte vor einem echten Betrieb

| Thema | Was noch fehlt |
| --- | --- |
| **Nutzungsbedingungen je Portal** | Für jedes Amt im Katalog müssen die AGB/Nutzungsbedingungen einzeln geprüft werden. Deshalb sind alle nicht-Demo-Einträge mit `active: false` und `verified: false` hinterlegt. |
| **robots.txt** | Der Scanner wertet sie derzeit nicht aus. Vor Freischaltung eines echten Adapters muss die `robots.txt` der Instanz geprüft und respektiert werden. |
| **Kontaktaufnahme** | Der ehrlichste Weg ist, die Behörde vorab zu fragen. Manche stellen bei Nachfrage eine offizielle Schnittstelle bereit — der eTermin-Adapter ist genau darauf ausgelegt (API-Key statt Scraping). |
| **DSGVO-Dokumente** | Verzeichnis von Verarbeitungstätigkeiten, Datenschutzerklärung, Auftragsverarbeitung mit dem Push-Dienstleister (Expo). |
| **Serverstandort** | Push-Token sind personenbezogene Daten. Hosting und Push-Weiterleitung sollten innerhalb der EU liegen bzw. vertraglich abgesichert sein. |
| **Impressum** | Bei einem öffentlichen Angebot in Deutschland verpflichtend. |
| **Lastverträglichkeit** | Bei nennenswerter Nutzerzahl sollte die Abfragefrequenz mit der Behörde abgestimmt werden, statt sie ihr zuzumuten. |

## Was ausdrücklich nicht gebaut wurde

- Kein CAPTCHA-Löser, weder eigener noch über einen Dienst.
- Keine Rotation von IP-Adressen oder User-Agents, um Sperren zu umgehen.
- Kein Vorhalten („Blockieren“) von Terminen, um sie später zu vergeben.
- Kein Weiterverkauf von Terminen. Wird eine Sperre gesetzt, ist die richtige
  Antwort, den Adapter abzuschalten und mit der Behörde zu sprechen — nicht,
  die Sperre zu umgehen.
