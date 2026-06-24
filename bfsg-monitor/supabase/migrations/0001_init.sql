-- 0001_init.sql — BFSG-Monitor initial schema, RLS policies, and storage.
--
-- Data model per the product spec (§7). Row Level Security: each user may only
-- access their own rows. `scan_jobs` and `free_scan_log` have RLS enabled with
-- NO policies, so only the service role (which bypasses RLS) can touch them.
-- The scan worker writes scans/storage via the service role.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- profiles: 1:1 with auth.users
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  company_name text,
  stripe_customer_id text,
  plan text not null default 'free', -- free | starter | pro
  plan_status text not null default 'inactive', -- active | trialing | past_due | canceled | inactive
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  url text not null,
  label text,
  monitoring_enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists domains_user_id_idx on public.domains (user_id);

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references public.domains (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  type text not null, -- free | full | monitor
  status text not null default 'queued', -- queued | running | done | error
  score int,
  total_issues int,
  count_critical int,
  count_serious int,
  count_moderate int,
  count_minor int,
  pages_scanned int,
  raw_result jsonb,
  pdf_path text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists scans_domain_id_idx on public.scans (domain_id);
create index if not exists scans_user_id_idx on public.scans (user_id);

create table if not exists public.scan_jobs (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains (id) on delete cascade,
  type text not null, -- full | monitor
  status text not null default 'pending', -- pending | processing | done | error
  attempts int not null default 0,
  scheduled_for timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists scan_jobs_queue_idx on public.scan_jobs (status, scheduled_for);

create table if not exists public.accessibility_statements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  domain_id uuid references public.domains (id) on delete set null,
  company_name text,
  contact_email text,
  conformance_text text,
  known_limitations text,
  generated_html text,
  pdf_path text,
  created_at timestamptz not null default now()
);
create index if not exists statements_user_id_idx on public.accessibility_statements (user_id);

create table if not exists public.free_scan_log (
  id bigserial primary key,
  ip text,
  domain text,
  created_at timestamptz not null default now()
);
create index if not exists free_scan_log_ip_idx on public.free_scan_log (ip, created_at);
create index if not exists free_scan_log_domain_idx on public.free_scan_log (domain, created_at);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.domains enable row level security;
alter table public.scans enable row level security;
alter table public.scan_jobs enable row level security;
alter table public.accessibility_statements enable row level security;
alter table public.free_scan_log enable row level security;

-- profiles: owner-only
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = user_id);

-- domains: owner-only, all actions
create policy "domains_all_own" on public.domains
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- scans: owner may read; writes happen via the service role (worker)
create policy "scans_select_own" on public.scans
  for select using (auth.uid() = user_id);

-- accessibility_statements: owner-only, all actions
create policy "statements_all_own" on public.accessibility_statements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- scan_jobs & free_scan_log: RLS on, no policies => service-role only.

-- ---------------------------------------------------------------------------
-- Storage: private "reports" bucket (signed URLs).
-- Files are stored under "<user_id>/..." so owners can read their own objects;
-- the worker uploads via the service role.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

create policy "reports_read_own" on storage.objects
  for select using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
