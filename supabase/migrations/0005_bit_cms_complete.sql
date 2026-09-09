-- 0005_bit_cms_complete.sql
-- Vervollstaendigt das BIT-CMS: Textbausteine (bit_content, bisher nur im
-- Code referenziert), Unterseiten, FAQ, Team-Kontakte und Stellenanzeigen.
-- RLS-Muster wie bei bit_products: oeffentlich nur Veroeffentlichtes,
-- Schreiben ausschliesslich fuer Admin/Editor (bit_is_admin()).

-- ------------------------------------------------- Textbausteine (Key/Value)
create table if not exists bit_content (
    key varchar(200) primary key,
    value text not null default '',
    updated_at timestamptz not null default now()
);

create or replace function bit_touch_content_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;
drop trigger if exists trg_bit_content_updated on bit_content;
create trigger trg_bit_content_updated before update on bit_content
    for each row execute function bit_touch_content_updated_at();

alter table bit_content enable row level security;
create policy bit_content_public_read on bit_content
    for select using (true);
create policy bit_content_admin_write on bit_content
    for all using (bit_is_admin()) with check (bit_is_admin());

-- ---------------------------------------------------------------- Unterseiten
-- Inhalte im leichten Markdown der Website ("## ", "### ", "- ", "| a | b",
-- "!img pfad|alt") -- identisch zum bisherigen Importformat aus pages.ts.
create table if not exists bit_pages (
    id uuid primary key default gen_random_uuid(),
    slug varchar(240) not null unique,
    title varchar(300) not null,
    meta_title varchar(300),
    meta_description text,
    body text not null default '',
    status bit_product_status not null default 'draft',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_bit_pages_status on bit_pages(status);

drop trigger if exists trg_bit_pages_updated on bit_pages;
create trigger trg_bit_pages_updated before update on bit_pages
    for each row execute function bit_touch_updated_at();

alter table bit_pages enable row level security;
create policy bit_pages_public_read on bit_pages
    for select using (status = 'published' or bit_is_admin());
create policy bit_pages_admin_write on bit_pages
    for all using (bit_is_admin()) with check (bit_is_admin());

-- ----------------------------------------------------------------------- FAQ
create table if not exists bit_faq (
    id uuid primary key default gen_random_uuid(),
    group_name varchar(200) not null default '',
    question text not null,
    answer text not null default '',
    sort_order integer not null default 0,
    status bit_product_status not null default 'published',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_bit_faq_sort on bit_faq(sort_order);

drop trigger if exists trg_bit_faq_updated on bit_faq;
create trigger trg_bit_faq_updated before update on bit_faq
    for each row execute function bit_touch_updated_at();

alter table bit_faq enable row level security;
create policy bit_faq_public_read on bit_faq
    for select using (status = 'published' or bit_is_admin());
create policy bit_faq_admin_write on bit_faq
    for all using (bit_is_admin()) with check (bit_is_admin());

-- ------------------------------------------------------------- Team-Kontakte
-- css_only: Eintrag erscheint nur als CSS-content (nicht indexierbar) --
-- wird derzeit fuer N. F. genutzt.
create table if not exists bit_team (
    id uuid primary key default gen_random_uuid(),
    name varchar(200) not null,
    role varchar(240) not null default '',
    phone varchar(80) not null default '',
    email varchar(240) not null default '',
    sort_order integer not null default 0,
    css_only boolean not null default false,
    status bit_product_status not null default 'published',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_bit_team_sort on bit_team(sort_order);

drop trigger if exists trg_bit_team_updated on bit_team;
create trigger trg_bit_team_updated before update on bit_team
    for each row execute function bit_touch_updated_at();

alter table bit_team enable row level security;
create policy bit_team_public_read on bit_team
    for select using (status = 'published' or bit_is_admin());
create policy bit_team_admin_write on bit_team
    for all using (bit_is_admin()) with check (bit_is_admin());

-- ------------------------------------------------------------ Stellenanzeigen
create table if not exists bit_jobs (
    id uuid primary key default gen_random_uuid(),
    slug varchar(200) not null unique,
    title varchar(300) not null,
    intro text not null default '',
    body text not null default '',
    tasks_title varchar(240) not null default 'Ihre Aufgaben:',
    tasks text[] not null default '{}',
    closing text not null default '',
    sort_order integer not null default 0,
    status bit_product_status not null default 'published',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_bit_jobs_sort on bit_jobs(sort_order);

drop trigger if exists trg_bit_jobs_updated on bit_jobs;
create trigger trg_bit_jobs_updated before update on bit_jobs
    for each row execute function bit_touch_updated_at();

alter table bit_jobs enable row level security;
create policy bit_jobs_public_read on bit_jobs
    for select using (status = 'published' or bit_is_admin());
create policy bit_jobs_admin_write on bit_jobs
    for all using (bit_is_admin()) with check (bit_is_admin());
