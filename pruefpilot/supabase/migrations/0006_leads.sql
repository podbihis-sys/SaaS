-- Vormerkliste der Validierungsphase (PRD Milestone 1).
create table leads (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    name text,
    company_size text check (company_size in ('1-4', '5-19', '20-49', '50+')),
    source text not null default 'landing',
    created_at timestamptz not null default now()
);

create unique index leads_email_unique_idx on leads (lower(email));

alter table leads enable row level security;

-- Nur Einfügen, auch anonym (öffentliches Formular). Bewusst KEINE select/update/delete-Policies:
-- Auswertung erfolgt ausschließlich founder-seitig (SQL-Editor/Service-Role).
create policy leads_insert_public on leads
    for insert to anon, authenticated
    with check (true);

-- Nachtrag zu 0002: auch anon darf den RLS-Helper ausführen — auth.uid() ist dort null,
-- current_company_id() liefert null und alle Policies werten zu false (0 Zeilen).
-- Ohne dieses Grant wirft jede anonyme Abfrage auf RLS-Tabellen "permission denied for function".
grant execute on function current_company_id() to anon;
