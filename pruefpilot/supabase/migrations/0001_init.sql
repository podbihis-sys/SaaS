create extension if not exists pgcrypto;

create table companies (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null unique references auth.users (id) on delete cascade,
    name text not null,
    contact_email text not null,
    created_at timestamptz not null default now()
);

-- Globale, schreibgeschützte Vorlagen. Spiegel in lib/categories.ts — beide gemeinsam pflegen.
create table device_categories (
    id text primary key,
    name_de text not null,
    legal_basis text not null,
    default_interval_months integer not null check (default_interval_months between 1 and 120),
    sort integer not null default 0
);

create table devices (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies (id) on delete cascade,
    category_id text not null references device_categories (id),
    name text not null,
    location text,
    serial_number text,
    interval_months integer not null check (interval_months between 1 and 120),
    next_due_date date not null,
    status text not null default 'active' check (status in ('active', 'retired')),
    public_code text not null unique,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index devices_company_id_idx on devices (company_id);
create index devices_due_idx on devices (company_id, next_due_date);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger devices_set_updated_at
    before update on devices
    for each row execute function set_updated_at();
