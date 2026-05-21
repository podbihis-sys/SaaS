create extension if not exists pgcrypto;

create table if not exists companies (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    address text,
    vat_id text,
    default_vat_rate numeric(5,4) not null default 0.19,
    logo_url text,
    bank_details jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists memberships (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    user_id uuid not null,
    role text not null check (role in ('owner','admin','member')),
    created_at timestamptz not null default now(),
    unique (company_id, user_id)
);
create index if not exists idx_memberships_company_id on memberships(company_id);
create index if not exists idx_memberships_user_id on memberships(user_id);

create table if not exists customers (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    name text not null,
    email text,
    phone text,
    address text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_customers_company_id on customers(company_id);
create index if not exists idx_customers_company_created on customers(company_id, created_at desc);

create table if not exists inquiries (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    customer_id uuid references customers(id) on delete cascade,
    title text not null,
    description text,
    status text not null check (status in ('new','analyzing','analyzed','quoted','accepted','rejected')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_inquiries_company_id on inquiries(company_id);
create index if not exists idx_inquiries_company_created on inquiries(company_id, created_at desc);
create index if not exists idx_inquiries_customer_id on inquiries(customer_id);

create table if not exists inquiry_images (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    inquiry_id uuid not null references inquiries(id) on delete cascade,
    storage_path text not null,
    mime_type text,
    width int,
    height int,
    created_at timestamptz not null default now()
);
create index if not exists idx_inquiry_images_company_id on inquiry_images(company_id);
create index if not exists idx_inquiry_images_inquiry_id on inquiry_images(inquiry_id);

create table if not exists ai_analyses (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    inquiry_id uuid not null references inquiries(id) on delete cascade,
    model text not null,
    payload jsonb not null,
    created_at timestamptz not null default now()
);
create index if not exists idx_ai_analyses_company_id on ai_analyses(company_id);
create index if not exists idx_ai_analyses_inquiry_id on ai_analyses(inquiry_id);
create index if not exists idx_ai_analyses_company_created on ai_analyses(company_id, created_at desc);

create table if not exists price_lists (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    name text not null,
    is_default boolean not null default false,
    created_at timestamptz not null default now()
);
create index if not exists idx_price_lists_company_id on price_lists(company_id);
create index if not exists idx_price_lists_company_created on price_lists(company_id, created_at desc);

create table if not exists price_items (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    price_list_id uuid not null references price_lists(id) on delete cascade,
    kind text not null check (kind in ('labor','material','area')),
    key text not null,
    label text not null,
    unit text not null,
    price numeric(12,2) not null,
    currency text not null default 'EUR',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (price_list_id, key)
);
create index if not exists idx_price_items_company_id on price_items(company_id);
create index if not exists idx_price_items_price_list_id on price_items(price_list_id);

create table if not exists quotes (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    inquiry_id uuid references inquiries(id) on delete cascade,
    customer_id uuid references customers(id) on delete cascade,
    number text not null,
    status text not null,
    subtotal numeric(12,2) not null default 0,
    vat_rate numeric(5,4) not null default 0.19,
    vat_amount numeric(12,2) not null default 0,
    total numeric(12,2) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists idx_quotes_company_id on quotes(company_id);
create index if not exists idx_quotes_company_created on quotes(company_id, created_at desc);
create index if not exists idx_quotes_inquiry_id on quotes(inquiry_id);
create index if not exists idx_quotes_customer_id on quotes(customer_id);

create table if not exists quote_positions (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    quote_id uuid not null references quotes(id) on delete cascade,
    position int not null,
    label text not null,
    unit text not null,
    quantity numeric(12,2) not null,
    unit_price numeric(12,2) not null,
    line_total numeric(12,2) not null,
    needs_pricing boolean not null default false
);
create index if not exists idx_quote_positions_company_id on quote_positions(company_id);
create index if not exists idx_quote_positions_quote_id on quote_positions(quote_id);

create table if not exists company_settings (
    company_id uuid primary key references companies(id) on delete cascade,
    currency text not null default 'EUR',
    locale text not null default 'de-DE',
    signature_block text,
    footer text
);
