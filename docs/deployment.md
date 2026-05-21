# Deployment

## Environments

| Env | Purpose | Branch | URL |
| --- | --- | --- | --- |
| dev | Local development with Docker Compose. | feature branches | `http://localhost:3000`, `http://localhost:8000` |
| staging | Pre-production smoke tests. | `dev` | `https://staging.example.com` |
| prod | Production. | `main` | `https://app.example.com` |

## Database

Postgres is hosted on Supabase. Migrations live in two places that must stay in sync:

- `backend/alembic/versions/*.py` — applied at backend startup (`alembic upgrade head`).
- `supabase/migrations/*.sql` — applied via `supabase db push` for the managed instance and used as a reference for direct SQL apply.

Apply schema changes with the Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## Backend

The backend image is built from `./backend/Dockerfile`. At container start it runs `alembic upgrade head` then `uvicorn app.main:app`. Recommended hosting: Fly.io, Render, or a Kubernetes deployment. Required env vars are listed in the root `README.md`.

Health check: `GET /healthz` should return 200 with `{ "status": "ok" }`.

## Web

The Next.js app is built from `./web/Dockerfile` or deployed to Vercel. Required public env vars:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Mobile

The Expo app is shipped via EAS Build. Update `mobile/app.json` with the production API URL and Supabase keys before building. Internal builds are uploaded to TestFlight and Internal App Sharing.

## CI

GitHub Actions in `.github/workflows/`:

- `backend.yml` runs ruff and pytest on Python 3.12 with uv.
- `web.yml` runs `pnpm install`, `tsc --noEmit`, and `pnpm build` on Node 20.
- `mobile.yml` runs `tsc --noEmit` on Node 20.

## Secrets

Production secrets live in the hosting provider's secret store (Fly.io secrets, Vercel env, GitHub Actions secrets for CI). Never commit `.env` or service-role keys. `.gitignore` excludes `.env*` except `.env.example`.

## Release process

1. Open a PR from `feat/*` into `dev`. CI must be green.
2. Squash-merge into `dev`. The staging environment auto-deploys from `dev`.
3. When a release is ready, open a PR from `dev` into `main`.
4. Merge with a regular merge commit and tag `vX.Y.Z`. Production auto-deploys from the tag.
