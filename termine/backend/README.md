# TerminRadar backend

FastAPI service that watches appointment availability at German public
authorities and pushes an alert when a free slot matches a user's search order.

## What it does

1. **Scan** — a scheduler polls each office/service pair that somebody is
   actually watching, through a per-vendor adapter (`app/providers/`).
2. **Diff** — the result is reconciled against the `slots` table, so both new
   appointments and disappearing ones are tracked.
3. **Match** — every new slot is tested against the active watches
   (`app/services/matcher.py`): errand, offices, date window, weekdays, time of
   day, minimum notice.
4. **Notify** — matches become `notifications` and go out via Expo push, with
   per-slot deduplication, an hourly cap per watch, and quiet hours.
5. **Hand off** — the app asks for a booking URL and sends the user into the
   authority's own flow. The backend never books anything itself; see
   [`../docs/legal.md`](../docs/legal.md).

## Layout

```
app/
  api/v1/      HTTP routes
  catalog/     hand-maintained office catalogue
  core/        errors, ids, geo helpers
  models/      SQLAlchemy models
  providers/   one adapter per booking system + shared HTML/taxonomy helpers
  schemas/     Pydantic request/response models
  services/    scanner, matcher, alerting, notifier
alembic/       migrations
scripts/       seed.py
tests/
```

## Running it

```bash
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python -e ".[dev]"
cp .env.example .env

# Postgres via the compose file one level up, or point DATABASE_URL anywhere
.venv/bin/alembic upgrade head
.venv/bin/python -m scripts.seed

.venv/bin/uvicorn app.main:app --reload
```

The API is then on `http://localhost:8000`, OpenAPI on `/docs`.

Out of the box `SCANNER_PROVIDERS=demo`, so the scanner produces synthetic
availability and contacts no real authority. That is enough to exercise the
whole path — watch, scan, match, push. Enabling a real provider is a deliberate
act: see the environment table below and read `../docs/legal.md` first.

## Environment

| Name | Default | Purpose |
| --- | --- | --- |
| `ENV` | `dev` | `dev` / `staging` / `prod` / `test`. |
| `LOG_LEVEL` | `INFO` | Python log level. |
| `DATABASE_URL` | local Postgres | Async SQLAlchemy URL. |
| `TEST_DATABASE_URL` | – | Overrides the URL under pytest. |
| `JWT_SECRET` | dev value | **Must** be replaced outside dev; signs device tokens. |
| `JWT_TTL_DAYS` | `365` | Device token lifetime. |
| `CORS_ORIGINS` | Expo dev hosts | Comma-separated allowed origins. |
| `SCANNER_ENABLED` | `true` | Runs the scan loop inside the API process. |
| `SCANNER_PROVIDERS` | `demo` | Comma-separated adapters allowed to make requests. |
| `SCANNER_MIN_INTERVAL_SECONDS` | `120` | Deployment-wide floor between scans of one pair. |
| `SCANNER_TICK_SECONDS` | `30` | How often the loop looks for due work. |
| `SCANNER_HORIZON_DAYS` | `90` | How far ahead slots are collected. |
| `SCANNER_FAILURE_THRESHOLD` | `5` | Consecutive failures before an office cools down. |
| `SCANNER_COOLDOWN_SECONDS` | `1800` | Length of that cool-down. |
| `HTTP_USER_AGENT` | identifying string | Sent on every outbound request. Keep it honest and contactable. |
| `HTTP_TIMEOUT_SECONDS` | `15` | Per-request timeout. |
| `PUSH_ENABLED` | `true` | Set false to log pushes instead of sending them. |
| `EXPO_PUSH_URL` | Expo endpoint | Push API URL. |
| `EXPO_ACCESS_TOKEN` | – | Required only if the Expo project enforces push security. |
| `NOTIFY_MAX_PER_HOUR` | `12` | Cap on pushes per watch per hour. |

## Tests

```bash
.venv/bin/pytest
```

Tests run against SQLite and never touch the network: provider tests use
captured HTML fixtures, and push delivery is asserted through a stubbed
transport.
