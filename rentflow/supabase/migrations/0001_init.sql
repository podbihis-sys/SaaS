-- ===========================================================================
-- RentFlow — 0001 schema (prompt §7)
-- Multi-tenant rental booking platform. One profile == one rental business.
-- Money separation guardrail: tenant payments NEVER touch the platform; they
-- run as Stripe Connect direct charges on the tenant's own connected account.
-- ===========================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "btree_gist";  -- required for the EXCLUDE constraint below

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users (one rental business / tenant)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id                    uuid primary key references auth.users (id) on delete cascade,
  email                      text,
  company_name               text,
  slug                       text unique,               -- public booking page /b/[slug]
  stripe_customer_id         text,                       -- PLATFORM subscription
  stripe_connect_account_id  text,                       -- connected acct for TENANT payments
  connect_charges_enabled    boolean not null default false, -- synced from account.updated
  plan                       text not null default 'free',     -- free | solo | pro
  plan_status                text not null default 'inactive', -- active|trialing|past_due|canceled|inactive
  current_period_end         timestamptz,
  branding_enabled           boolean not null default true,    -- "Powered by RentFlow"
  created_at                 timestamptz not null default now(),
  constraint profiles_plan_check check (plan in ('free','solo','pro')),
  constraint profiles_plan_status_check
    check (plan_status in ('active','trialing','past_due','canceled','inactive'))
);

comment on table public.profiles is 'One rental business (tenant). 1:1 with auth.users.';

-- ---------------------------------------------------------------------------
-- items: inventory. quantity = number of identical interchangeable units.
-- ---------------------------------------------------------------------------
create table if not exists public.items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (user_id) on delete cascade,
  name           text not null,
  description    text,
  category       text,
  quantity       int not null default 1 check (quantity >= 1),
  price_per_day  numeric(10,2) not null check (price_per_day >= 0),
  deposit_amount numeric(10,2) not null default 0 check (deposit_amount >= 0),
  image_paths    text[] not null default '{}',           -- Supabase Storage object paths
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists items_user_id_idx on public.items (user_id);

-- ---------------------------------------------------------------------------
-- item_blocks: manual unavailability (maintenance, own use). Each overlapping
-- block reduces availability by one unit (prompt §10 availability formula).
-- ---------------------------------------------------------------------------
create table if not exists public.item_blocks (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references public.items (id) on delete cascade,
  user_id    uuid not null references public.profiles (user_id) on delete cascade,
  start_date date not null,
  end_date   date not null,                              -- inclusive
  reason     text,
  created_at timestamptz not null default now(),
  constraint item_blocks_range_check check (start_date <= end_date)
);

create index if not exists item_blocks_item_id_idx on public.item_blocks (item_id);

-- ---------------------------------------------------------------------------
-- bookings: the core entity. Day-granular, start..end inclusive.
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references public.profiles (user_id) on delete cascade,
  item_id                   uuid not null references public.items (id) on delete restrict,
  customer_name             text,
  customer_email            text,
  customer_phone            text,
  start_date                date not null,
  end_date                  date not null,              -- inclusive
  quantity                  int not null default 1 check (quantity >= 1),
  status                    text not null default 'pending',
  rental_total              numeric(10,2),
  deposit_total             numeric(10,2),
  deposit_payment_intent_id text,                        -- on the CONNECTED account
  deposit_status            text not null default 'none', -- none|held|charged|refunded
  rental_payment_status     text not null default 'unpaid', -- unpaid|paid
  hold_expires_at           timestamptz,                 -- TTL for pending reservation
  confirmation_pdf_path     text,
  -- Denormalized from items.quantity = 1 at creation time. Drives the partial
  -- EXCLUDE constraint so it only guards genuinely single-unit items; multi-unit
  -- items are guarded by the transactional counting in create_booking_hold().
  is_unique                 boolean not null default false,
  created_at                timestamptz not null default now(),
  constraint bookings_range_check check (start_date <= end_date),
  constraint bookings_status_check
    check (status in ('pending','confirmed','active','returned','cancelled','expired')),
  constraint bookings_deposit_status_check
    check (deposit_status in ('none','held','charged','refunded')),
  constraint bookings_rental_payment_status_check
    check (rental_payment_status in ('unpaid','paid'))
);

create index if not exists bookings_user_id_idx on public.bookings (user_id);
create index if not exists bookings_item_id_idx on public.bookings (item_id);
create index if not exists bookings_status_idx  on public.bookings (status);
-- Speeds up the pending-hold sweep and availability counting.
create index if not exists bookings_hold_expires_idx
  on public.bookings (hold_expires_at) where status = 'pending';

-- GUARDRAIL #2 (second line of defence): for single-unit items, the database
-- physically forbids two overlapping confirmed/active bookings. This makes a
-- double-booking impossible even if application logic were wrong. Multi-unit
-- items intentionally fall back to the transactional counting in
-- create_booking_hold() (see 0003).
alter table public.bookings
  drop constraint if exists no_overlap_qty1;
alter table public.bookings
  add constraint no_overlap_qty1
  exclude using gist (
    item_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('confirmed','active') and is_unique);

-- ---------------------------------------------------------------------------
-- stripe_events: webhook idempotency ledger (platform + connect)
-- ---------------------------------------------------------------------------
create table if not exists public.stripe_events (
  id           text primary key,                         -- Stripe event id (evt_...)
  type         text,
  processed_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Auto-provision a profile + unique slug when a new auth user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.slugify(p_input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(
      lower(translate(coalesce(p_input, ''),
        'äöüßàáâãäåæçèéêëìíîïñòóôõöùúûü',
        'aouss aaaaaaaceeeeiiiinooooouuuu')),
      '[^a-z0-9]+', '-', 'g'
    )
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base text;
  v_slug text;
  v_n    int := 0;
begin
  v_base := nullif(public.slugify(split_part(new.email, '@', 1)), '');
  v_base := coalesce(v_base, 'betrieb');
  v_slug := v_base;
  -- Ensure uniqueness with a numeric suffix.
  while exists (select 1 from public.profiles where slug = v_slug) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n::text;
  end loop;

  insert into public.profiles (user_id, email, slug)
  values (new.id, new.email, v_slug)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
