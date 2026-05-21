# Deployment

## Live Supabase Project

| | Value |
| --- | --- |
| Project | `handwerk-saas` |
| Ref | `nmxexbprvuzwyhxtfnub` |
| Region | `eu-central-1` |
| URL | `https://nmxexbprvuzwyhxtfnub.supabase.co` |

Anon key and service-role key live in the Supabase dashboard. Never commit them.

## Environments

| Env | Purpose | Branch | URL |
| --- | --- | --- | --- |
| dev | Local development with Docker Compose. | feature branches | `http://localhost:3000`, `http://localhost:8000` |
| staging | Pre-production smoke tests. | `dev` | TBD |
| prod | Production. | `main` | TBD |

## Database

Postgres is hosted on Supabase. Schema is canonical in `backend/alembic/versions/0001_initial.py`; `supabase/migrations/*.sql` mirrors it for direct apply via the Supabase MCP or CLI.

Apply schema changes with the Supabase CLI:

```bash
supabase link --project-ref nmxexbprvuzwyhxtfnub
supabase db push
```

Or via MCP `apply_migration` for individual statements.

## Backend (Fly.io recommended)

Image built from `./backend/Dockerfile`. At start it runs `alembic upgrade head` then `uvicorn app.main:app`. Required env:

- `DATABASE_URL` — Supabase Postgres connection string (incl. password) from project settings
- `SUPABASE_URL=https://nmxexbprvuzwyhxtfnub.supabase.co`
- `SUPABASE_JWT_SECRET` — from Supabase project API settings
- `SUPABASE_SERVICE_ROLE_KEY` — for signed-URL storage operations
- `OPENAI_API_KEY`
- `OPENAI_MODEL=gpt-4o`
- `CORS_ORIGINS=https://app.example.com,http://localhost:3000`
- `DEFAULT_VAT_RATE=0.19`
- `ENV=production`
- `LOG_LEVEL=info`

Health: `GET /api/v1/health` returns 200.

## Web (Vercel)

`web/vercel.json` configures the build. Required env (set in Vercel project settings):

- `NEXT_PUBLIC_API_URL` — backend URL
- `NEXT_PUBLIC_SUPABASE_URL=https://nmxexbprvuzwyhxtfnub.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key from Supabase

Region: `fra1` (Frankfurt) to be close to Supabase `eu-central-1`.

## Mobile

For MVP, the Expo Go workflow is sufficient. Run `npx expo start` in `mobile/`, scan QR with Expo Go. Required env (`mobile/.env`):

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL=https://nmxexbprvuzwyhxtfnub.supabase.co`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

For EAS Build (later): `eas build --profile development --platform all`.

## CI

GitHub Actions in `.github/workflows/`:

- `backend.yml` — ruff + pytest on Python 3.12 with uv, sqlite in-memory for tests, WeasyPrint system deps installed.
- `web.yml` — `npm install --legacy-peer-deps` + `tsc --noEmit` + `npm run build` on Node 20.
- `mobile.yml` — `npm install --legacy-peer-deps` + `tsc --noEmit` on Node 20.

## Secrets

Production secrets live in the hosting provider's secret store (Vercel env, Fly.io secrets, GitHub Actions secrets for CI). Never commit `.env` or service-role keys. `.gitignore` excludes `.env*` except `.env.example`.

## Release process

1. Open a PR into `main`. CI must be green.
2. Merge once reviewed.
3. Vercel auto-deploys from `main`.
4. Tag `vX.Y.Z` for backend releases.
