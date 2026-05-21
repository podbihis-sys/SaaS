# Multi-tenancy

## Tenant model

A tenant is a `companies` row. Users belong to one or more companies via `memberships(company_id, user_id, role)`. The Supabase JWT identifies the user (`auth.uid()`), and the active company is selected by the client per request via the `X-Company-Id` header. The backend verifies that the JWT subject has an active membership for that company before doing anything.

## Defence in depth

Two layers enforce isolation:

1. Application layer: every repository query filters by `company_id`, taken from the verified `X-Company-Id` header. Mutations set `company_id` from the same value, never from the request body.
2. Database layer: Row Level Security policies on every tenant table delegate to `auth_has_company(uuid)`. Even if a query forgets the `company_id` predicate, RLS will hide rows that belong to other tenants when the session uses the Supabase anon/authenticated role.

## The `auth_has_company` helper

```sql
create or replace function auth_has_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from memberships m
        where m.company_id = target_company_id
          and m.user_id = auth.uid()
    );
$$;
```

`security definer` lets the function read `memberships` even when the caller cannot, while `set search_path = public` blocks search-path injection. Execute permission is granted only to the `authenticated` role.

## Policies

- `companies`: a row is visible iff `auth_has_company(id)`.
- `memberships`: a user can see their own membership rows and (if owner/admin) all memberships of their companies.
- Every other tenant table (`customers`, `inquiries`, `inquiry_images`, `ai_analyses`, `price_lists`, `price_items`, `quotes`, `quote_positions`, `company_settings`): visible and writable iff `auth_has_company(company_id)`.

## Service role

The backend connects with the Supabase service-role key. This bypasses RLS, which is why the application layer's `company_id` filtering is non-negotiable. Anything reading from the database without a tenant filter is a bug.

## Adding a new tenant table

1. Add `company_id uuid not null references companies(id) on delete cascade`.
2. Add an index on `company_id` and, if the table is listed, on `(company_id, created_at desc)`.
3. `alter table … enable row level security;`
4. `create policy <name>_tenant on <table> for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));`
5. Mirror the change in the Alembic migration and ORM model.
6. Make sure every repository function for the table takes `company_id` as a required argument.
