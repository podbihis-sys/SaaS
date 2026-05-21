# Supabase

SQL schema and Row Level Security for the project's Postgres database. The same migrations apply to the managed Supabase project and to the local Postgres started by `docker-compose.yml`.

## Layout

```
supabase/
  config.toml          Supabase CLI config (local stack, storage bucket, auth)
  migrations/
    0001_init.sql      Tables, indexes, constraints
    0002_rls.sql       RLS policies and auth_has_company helper
  seed.sql             Sample company, price list, customer for development
```

## Apply against a remote Supabase project

```bash
supabase link --project-ref <ref>
supabase db push
```

## Apply against the local Docker stack

```bash
make up
docker compose exec -T db psql -U postgres -d handwerk < supabase/migrations/0001_init.sql
docker compose exec -T db psql -U postgres -d handwerk < supabase/migrations/0002_rls.sql
make seed
```

The backend's Alembic migrations mirror `0001_init.sql`. When changing the schema, update both the Alembic revision and the SQL migration in this directory in the same PR.

## Multi-tenancy

Every tenant-scoped table has a `company_id` column and a policy that delegates to the `auth_has_company(uuid)` SECURITY DEFINER helper. The helper checks `memberships` for the current `auth.uid()`. See `docs/multi-tenant.md`.
