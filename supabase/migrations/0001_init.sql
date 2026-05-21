create extension if not exists pgcrypto;

do $$ begin
    create type membership_role as enum ('owner', 'admin', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
    create type inquiry_status as enum ('new', 'ai_pending', 'ai_done', 'quoted', 'closed', 'canceled');
exception when duplicate_object then null; end $$;

do $$ begin
    create type price_item_kind as enum ('labor', 'material', 'area', 'flat');
exception when duplicate_object then null; end $$;

do $$ begin
    create type quote_status as enum ('draft', 'sent', 'accepted', 'rejected', 'expired');
exception when duplicate_object then null; end $$;

create table if not exists companies (
    id uuid primary key default gen_random_uuid(),
    name varchar(200) not null,
    slug varchar(80) not null unique,
    legal_name varchar(200),
    tax_id varchar(60),
    address_line1 varchar(200),
    address_line2 varchar(200),
    postal_code varchar(20),
    city varchar(120),
    country varchar(2) not null default 'DE',
    phone varchar(40),
    email varchar(200),
    logo_url varchar(500),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_companies_slug on companies(slug);

create table if not exists users (
    id uuid primary key,
    email varchar(200) not null unique,
    full_name varchar(200),
    avatar_url varchar(500),
    phone varchar(40),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_users_email on users(email);

create table if not exists memberships (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role membership_role not null default 'member',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_memberships_company_user unique (company_id, user_id)
);
create index if not exists ix_memberships_company_id on memberships(company_id);
create index if not exists ix_memberships_user_id on memberships(user_id);

create table if not exists company_settings (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null unique references companies(id) on delete cascade,
    vat_rate numeric(5,4) not null default 0.1900,
    currency varchar(3) not null default 'EUR',
    quote_number_prefix varchar(20) not null default 'AN-',
    quote_number_counter integer not null default 1,
    logo_url varchar(500),
    bank_name varchar(200),
    iban varchar(40),
    bic varchar(20),
    locale varchar(10) not null default 'de-DE',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists customers (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    full_name varchar(200) not null,
    email varchar(200),
    phone varchar(40),
    address_line1 varchar(200),
    address_line2 varchar(200),
    postal_code varchar(20),
    city varchar(120),
    country varchar(2) not null default 'DE',
    notes varchar(2000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_customers_company_id on customers(company_id);
create index if not exists ix_customers_company_created on customers(company_id, created_at);

create table if not exists inquiries (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    customer_id uuid references customers(id) on delete set null,
    title varchar(200) not null,
    description text,
    status inquiry_status not null default 'new',
    contact_email varchar(200),
    contact_phone varchar(40),
    address_line1 varchar(200),
    postal_code varchar(20),
    city varchar(120),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_inquiries_company_id on inquiries(company_id);
create index if not exists ix_inquiries_customer_id on inquiries(customer_id);
create index if not exists ix_inquiries_company_created on inquiries(company_id, created_at);
create index if not exists ix_inquiries_company_status on inquiries(company_id, status);

create table if not exists inquiry_images (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    inquiry_id uuid not null references inquiries(id) on delete cascade,
    storage_path varchar(600) not null,
    public_url varchar(800),
    content_type varchar(80) not null default 'image/jpeg',
    size_bytes integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_inquiry_images_company_id on inquiry_images(company_id);
create index if not exists ix_inquiry_images_inquiry_id on inquiry_images(inquiry_id);

create table if not exists ai_analyses (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    inquiry_id uuid not null references inquiries(id) on delete cascade,
    model varchar(80) not null,
    result jsonb not null,
    raw_response jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_ai_analyses_company_id on ai_analyses(company_id);
create index if not exists ix_ai_analyses_inquiry_id on ai_analyses(inquiry_id);

create table if not exists price_lists (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    name varchar(200) not null,
    is_default boolean not null default false,
    currency varchar(3) not null default 'EUR',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_price_lists_company_id on price_lists(company_id);

create table if not exists price_items (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    price_list_id uuid not null references price_lists(id) on delete cascade,
    key varchar(120) not null,
    label varchar(200) not null,
    kind price_item_kind not null,
    unit varchar(20) not null,
    unit_price numeric(12,4) not null,
    currency varchar(3) not null default 'EUR',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_price_items_list_key unique (price_list_id, key)
);
create index if not exists ix_price_items_company_id on price_items(company_id);
create index if not exists ix_price_items_price_list_id on price_items(price_list_id);
create index if not exists ix_price_items_company_key on price_items(company_id, key);

create table if not exists quotes (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    inquiry_id uuid references inquiries(id) on delete set null,
    customer_id uuid references customers(id) on delete set null,
    number varchar(40) not null,
    title varchar(200) not null,
    status quote_status not null default 'draft',
    currency varchar(3) not null default 'EUR',
    vat_rate numeric(5,4) not null,
    subtotal numeric(12,2) not null default 0,
    vat_amount numeric(12,2) not null default 0,
    total numeric(12,2) not null default 0,
    needs_pricing boolean not null default false,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_quotes_company_id on quotes(company_id);
create index if not exists ix_quotes_inquiry_id on quotes(inquiry_id);
create index if not exists ix_quotes_customer_id on quotes(customer_id);
create index if not exists ix_quotes_company_created on quotes(company_id, created_at);
create index if not exists ix_quotes_company_status on quotes(company_id, status);

create table if not exists quote_positions (
    id uuid primary key default gen_random_uuid(),
    company_id uuid not null references companies(id) on delete cascade,
    quote_id uuid not null references quotes(id) on delete cascade,
    position integer not null,
    item_key varchar(120),
    label varchar(300) not null,
    unit varchar(20) not null,
    quantity numeric(12,3) not null,
    unit_price numeric(12,4),
    line_total numeric(12,2),
    needs_pricing boolean not null default false,
    notes varchar(500),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_quote_positions_company_id on quote_positions(company_id);
create index if not exists ix_quote_positions_quote_id on quote_positions(quote_id);
