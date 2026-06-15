-- 0004_bit_news.sql
-- News-/Aktuelles-Beiträge für die öffentliche BIT-Website (/bit/news).
-- RLS wie bei bit_products: öffentlich nur veröffentlichte Beiträge lesbar,
-- Schreiben ausschließlich für Admin/Editor (bit_is_admin()).

create table if not exists bit_news (
    id uuid primary key default gen_random_uuid(),
    slug varchar(200) not null unique,
    title varchar(300) not null,
    excerpt text not null default '',
    body text not null default '',
    image_path varchar(600),
    image_alt varchar(300),
    published_at date,
    status bit_product_status not null default 'draft',
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists ix_bit_news_status on bit_news(status);
create index if not exists ix_bit_news_published on bit_news(published_at desc);

drop trigger if exists trg_bit_news_updated on bit_news;
create trigger trg_bit_news_updated before update on bit_news
    for each row execute function bit_touch_updated_at();

-- ---------------------------------------------------------------------- RLS
alter table bit_news enable row level security;

create policy bit_news_public_read on bit_news
    for select using (status = 'published' or bit_is_admin());
create policy bit_news_admin_write on bit_news
    for all using (bit_is_admin()) with check (bit_is_admin());
