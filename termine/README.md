# TerminRadar

Eine App für iOS, Android und Web, die freie Termine bei deutschen Ämtern
findet, per Push meldet und direkt ins offizielle Buchungsportal weiterleitet.

Ein Termin beim Bürgeramt ist selten „nicht verfügbar“ — er ist meistens für ein
paar Minuten verfügbar, nämlich dann, wenn jemand absagt. Wer zufällig gerade
hinschaut, bekommt ihn. Genau dieses Hinschauen übernimmt TerminRadar.

## Was die App macht

1. **Suchauftrag anlegen** — Anliegen (z. B. Personalausweis), Ämter, Wochentage,
   Uhrzeitfenster, gewünschter Vorlauf.
2. **Scannen** — der Server fragt die offiziellen Terminportale regelmäßig ab.
   Abgefragt wird nur, was tatsächlich jemand sucht.
3. **Benachrichtigen** — passt ein neu aufgetauchter Termin, kommt ein Push.
   Mit Entprellung pro Termin, Stundenlimit pro Suchauftrag und Nachtruhe.
4. **Buchen** — ein Tipp führt ins Portal des Amtes, so tief verlinkt, wie das
   jeweilige System es zulässt.

Gebucht wird **immer beim Amt**. Die App bucht nichts eigenständig — warum
nicht, steht in [`docs/legal.md`](./docs/legal.md), und diese Entscheidung prägt
den gesamten Entwurf.

## Aufbau

```
termine/
  backend/   FastAPI: Scanner, Matcher, Push, REST-API
  app/       Expo (React Native): iOS, Android, Web aus einer Codebasis
  docs/      Rechtliches, Adapter-Doku
```

```mermaid
flowchart LR
    subgraph Clients
        I[iOS]
        A[Android]
        W[Web]
    end
    I & A & W -->|REST + Gerätetoken| API[FastAPI]
    API --> DB[(Postgres)]
    SC[Scanner-Loop] --> DB
    SC -->|Adapter| P1[Berlin ZMS]
    SC --> P2[TEVIS]
    SC --> P3[netAppoint]
    SC --> P4[eTermin]
    SC --> M[Matcher] --> N[Expo Push] --> I & A
```

Der Scanner läuft im selben Prozess wie die API (`lifespan` in
`backend/app/main.py`). Bei dieser Größe ist das die richtige Wahl: eine
Deployment-Einheit, kein Broker, und der Abfragetakt liegt bei Minuten. Sobald
mehr als eine API-Replik nötig wird, gehört er in einen eigenen Prozess.

## Schnellstart

Voraussetzungen: Python 3.12, Node 20, npm.

```bash
# Backend
cd termine/backend
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -e ".[dev]"
cp .env.example .env

DATABASE_URL="sqlite+aiosqlite:///./dev.db" .venv/bin/alembic upgrade head
DATABASE_URL="sqlite+aiosqlite:///./dev.db" .venv/bin/python -m scripts.seed
DATABASE_URL="sqlite+aiosqlite:///./dev.db" .venv/bin/uvicorn app.main:app --reload
```

```bash
# App
cd termine/app
npm install
npm start          # dann i / a / w für iOS-Simulator, Android, Browser
```

Für Postgres statt SQLite liegt eine Compose-Datei bereit:

```bash
cd termine && docker compose up -d
```

In der Voreinstellung ist `SCANNER_PROVIDERS=demo`: ein synthetischer Anbieter,
der lokal Termine erfindet, die im Minutentakt auftauchen und verschwinden. Der
komplette Ablauf — Suchauftrag, Scan, Treffer, Benachrichtigung — lässt sich
damit durchspielen, ohne ein einziges echtes Amt zu kontaktieren.

Ein Ende-zu-Ende-Durchlauf ohne App:

```bash
cd termine/backend
DATABASE_URL="sqlite+aiosqlite:///./dev.db" PUSH_ENABLED=false SCANNER_ENABLED=false \
  .venv/bin/python -m scripts.smoke
```

## Tests

```bash
cd termine/backend && .venv/bin/pytest && .venv/bin/ruff check .
cd termine/app && npm run typecheck
```

Die Backend-Tests laufen gegen SQLite und gehen nie ins Netz: Adapter werden
gegen abgelegte HTML-Fixtures geprüft, Push-Zustellung über einen gestubbten
Transport.

## Stand der Dinge

**Fertig und geprüft:** Datenmodell, Scanner mit Abgleich und Rückzugslogik,
Matcher, Benachrichtigungen inklusive Entprellung, Ratenlimit und Nachtruhe,
REST-API, Buchungsübergabe, die vollständige App (Suchaufträge, Suche mit
Standort, Meldungen, Einstellungen, Buchungs-Flow), 101 Backend-Tests, sauberer
Typecheck der App.

**Noch nicht geprüft:** Die vier Adapter für echte Buchungssysteme sind
vollständig implementiert und über Fixtures getestet, aber nicht gegen die
Live-Systeme verifiziert. Alle echten Katalogeinträge sind deshalb mit
`active: false` hinterlegt. Was vor einer Freischaltung zu tun ist, steht in
[`docs/providers.md`](./docs/providers.md) und [`docs/legal.md`](./docs/legal.md).

**Bewusst nicht gebaut:** automatische Buchung, CAPTCHA-Umgehung, Umgehung von
Sperren.

## Weiterlesen

- [`backend/README.md`](./backend/README.md) — Umgebungsvariablen, Aufbau
- [`app/README.md`](./app/README.md) — Bildschirme, Build für iOS/Android
- [`docs/providers.md`](./docs/providers.md) — Adapter, Prüfstand, eigene ergänzen
- [`docs/legal.md`](./docs/legal.md) — rechtliche Leitplanken
