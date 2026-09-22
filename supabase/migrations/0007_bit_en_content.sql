-- Englische Fassungen für News und Stellen (CMS-pflegbar; Fallback im Code).
alter table public.bit_news
  add column if not exists title_en varchar(300),
  add column if not exists excerpt_en text,
  add column if not exists body_en text;

alter table public.bit_jobs
  add column if not exists title_en varchar(300),
  add column if not exists intro_en text,
  add column if not exists body_en text,
  add column if not exists tasks_title_en varchar(300),
  add column if not exists tasks_en text[],
  add column if not exists closing_en text;
