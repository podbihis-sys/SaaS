-- 0003_bit_cms.sql
-- CMS-Backend fuer die oeffentliche BIT-Website (/bit): Produkte, Kategorien,
-- Admin-Rollen + Einladungen sowie Storage fuer Produktbilder/Datenblaetter.
-- Einmandantig (eine Firmenseite) -- bewusst getrennt von den company_id-Tabellen
-- der SaaS-App.

create extension if not exists pgcrypto;

do $$ begin
    create type bit_product_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
    create type bit_admin_role as enum ('admin', 'editor');
exception when duplicate_object then null; end $$;

-- Gemeinsamer updated_at-Trigger
create or replace function bit_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ------------------------------------------------------------------ Kategorien
create table if not exists bit_categories (
    id text primary key,
    name varchar(160) not null,
    tagline varchar(240),
    description text,
    image_path varchar(600),
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists trg_bit_categories_updated on bit_categories;
create trigger trg_bit_categories_updated before update on bit_categories
    for each row execute function bit_touch_updated_at();

-- -------------------------------------------------------------------- Produkte
create table if not exists bit_products (
    id uuid primary key default gen_random_uuid(),
    slug varchar(200) not null unique,
    category_id text not null references bit_categories(id) on delete restrict,
    code varchar(120) not null default '',
    name varchar(240) not null,
    tagline varchar(300),
    description text not null default '',
    material varchar(240),
    temperature varchar(120),
    unit varchar(60) not null default 'Stück',
    sizes text[] not null default '{}',
    colors text[] not null default '{}',
    features text[] not null default '{}',
    applications text[] not null default '{}',
    tech jsonb not null default '[]'::jsonb,
    datasheet_url varchar(800),
    image_path varchar(600),
    image_alt varchar(300),
    status bit_product_status not null default 'draft',
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_bit_products_category on bit_products(category_id);
create index if not exists ix_bit_products_status on bit_products(status);
create index if not exists ix_bit_products_sort on bit_products(sort_order);

drop trigger if exists trg_bit_products_updated on bit_products;
create trigger trg_bit_products_updated before update on bit_products
    for each row execute function bit_touch_updated_at();

-- -------------------------------------------------------------- Admin-Rollen
create table if not exists bit_admins (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email varchar(240) not null,
    role bit_admin_role not null default 'editor',
    created_at timestamptz not null default now()
);

create table if not exists bit_admin_invites (
    id uuid primary key default gen_random_uuid(),
    email varchar(240) not null,
    role bit_admin_role not null default 'editor',
    token uuid not null default gen_random_uuid(),
    invited_by uuid references auth.users(id) on delete set null,
    accepted_at timestamptz,
    expires_at timestamptz not null default (now() + interval '14 days'),
    created_at timestamptz not null default now()
);
create index if not exists ix_bit_admin_invites_email on bit_admin_invites(email);
create unique index if not exists uq_bit_admin_invites_token on bit_admin_invites(token);

-- ------------------------------------------------------------- Helper / Checks
create or replace function bit_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (select 1 from bit_admins a where a.user_id = auth.uid());
$$;
revoke all on function bit_is_admin() from public;
grant execute on function bit_is_admin() to authenticated;

-- Einladung annehmen: ein eingeloggter Nutzer, dessen E-Mail zu einer gueltigen,
-- nicht abgelaufenen Einladung passt, wird damit zum Admin/Editor.
create or replace function bit_accept_invite(invite_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    inv bit_admin_invites;
    uemail text;
begin
    select email into uemail from auth.users where id = auth.uid();
    if uemail is null then
        raise exception 'not authenticated';
    end if;
    select * into inv from bit_admin_invites
        where token = invite_token and accepted_at is null and expires_at > now();
    if inv.id is null then
        raise exception 'invalid or expired invite';
    end if;
    if lower(inv.email) <> lower(uemail) then
        raise exception 'invite email mismatch';
    end if;
    insert into bit_admins (user_id, email, role)
        values (auth.uid(), uemail, inv.role)
        on conflict (user_id) do update set role = excluded.role;
    update bit_admin_invites set accepted_at = now() where id = inv.id;
end;
$$;
revoke all on function bit_accept_invite(uuid) from public;
grant execute on function bit_accept_invite(uuid) to authenticated;

-- ---------------------------------------------------------------------- RLS
alter table bit_categories enable row level security;
alter table bit_products enable row level security;
alter table bit_admins enable row level security;
alter table bit_admin_invites enable row level security;

-- Kategorien: oeffentlich lesbar; Schreiben nur Admin/Editor
create policy bit_categories_public_read on bit_categories
    for select using (true);
create policy bit_categories_admin_write on bit_categories
    for all using (bit_is_admin()) with check (bit_is_admin());

-- Produkte: oeffentlich nur veroeffentlichte; Admin sieht/aendert alles
create policy bit_products_public_read on bit_products
    for select using (status = 'published' or bit_is_admin());
create policy bit_products_admin_write on bit_products
    for all using (bit_is_admin()) with check (bit_is_admin());

-- Admins: Liste fuer Admins; eigene Zeile sichtbar; Schreiben nur Admin
create policy bit_admins_read on bit_admins
    for select using (bit_is_admin() or user_id = auth.uid());
create policy bit_admins_write on bit_admins
    for all using (bit_is_admin()) with check (bit_is_admin());

-- Einladungen: nur Admin
create policy bit_admin_invites_admin on bit_admin_invites
    for all using (bit_is_admin()) with check (bit_is_admin());

-- ------------------------------------------------------------------- Storage
-- Oeffentlicher Bucket fuer Produktbilder und Datenblaetter.
insert into storage.buckets (id, name, public)
values ('bit-product-images', 'bit-product-images', true)
on conflict (id) do nothing;

drop policy if exists bit_storage_public_read on storage.objects;
create policy bit_storage_public_read on storage.objects
    for select using (bucket_id = 'bit-product-images');

drop policy if exists bit_storage_admin_write on storage.objects;
create policy bit_storage_admin_write on storage.objects
    for all using (bucket_id = 'bit-product-images' and bit_is_admin())
    with check (bucket_id = 'bit-product-images' and bit_is_admin());
