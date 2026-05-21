# Handwerk SaaS Backend

Multi-tenant FastAPI backend for German craftsman businesses (Handwerksbetriebe).

## Stack

- Python 3.12, FastAPI 0.115+
- SQLAlchemy 2.0 (async) + Alembic
- Pydantic v2
- PostgreSQL (asyncpg)
- Supabase auth (JWT), Supabase Storage
- OpenAI Vision (Responses API)
- WeasyPrint (HTML to PDF)

## Local development

```bash
cp .env.example .env
# edit secrets

# install
uv sync --extra dev    # or: pip install -e ".[dev]"

# migrate
alembic upgrade head

# run
uvicorn app.main:app --reload --port 8000
```

OpenAPI is served at `http://localhost:8000/api/v1/openapi.json`. Swagger UI: `/docs`.

## Required environment variables

| Name | Description |
| ---- | ----------- |
| `DATABASE_URL` | Postgres URL (`postgresql+asyncpg://...`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_JWT_SECRET` | HS256 JWT secret (or use JWKS) |
| `SUPABASE_JWT_JWKS_URL` | Optional JWKS URL for RS256 verification |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for Storage signed URLs |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Default `gpt-4o` |
| `CORS_ORIGINS` | Comma separated allowed origins |
| `ENV` | `dev`, `staging`, `prod` |
| `LOG_LEVEL` | `DEBUG`/`INFO`/`WARNING` |
| `DEFAULT_VAT_RATE` | Default 0.19 |

## API Surface

All routes mounted under `/api/v1`:

- `GET /health` - liveness
- `GET /auth/me` - current user + memberships
- `GET /companies` / `POST /companies`
- `GET /customers` / `POST /customers` / `PATCH /customers/{id}`
- `GET /inquiries` / `POST /inquiries` / `POST /inquiries/{id}/images`
- `POST /ai/analyze` - run Vision on inquiry
- `GET /prices/lists` / `POST /prices/lists` / `POST /prices/items`
- `POST /quotes/from-inquiry/{inquiry_id}` - generate draft
- `GET /quotes/{id}/pdf` - download PDF

## Tests

```bash
TEST_DATABASE_URL=sqlite+aiosqlite:///:memory: pytest -q
```

Or against a real Postgres:

```bash
TEST_DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/handwerk_test pytest
```

## OpenAPI export

```bash
python scripts/export_openapi.py
# writes openapi.json
```

## Docker

```bash
docker build -t handwerk-backend .
docker run -p 8000:8000 --env-file .env handwerk-backend
```
