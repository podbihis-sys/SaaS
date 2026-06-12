-- Prüfhistorie ist append-only: bewusst KEINE update/delete-Policies (lückenlose Dokumentation).
create table inspections (
    id uuid primary key default gen_random_uuid(),
    device_id uuid not null references devices (id) on delete cascade,
    company_id uuid not null references companies (id) on delete cascade,
    inspected_at date not null,
    inspector_name text not null,
    result text not null check (result in ('passed', 'passed_with_defects', 'failed')),
    comment text,
    document_path text,
    created_at timestamptz not null default now()
);

create index inspections_device_idx on inspections (device_id, inspected_at desc);
create index inspections_company_idx on inspections (company_id);

-- Bei bestandener Prüfung springt die Fälligkeit auf inspected_at + Intervall.
-- Postgres klemmt Monatsenden wie lib/due.ts: 31.01. + 1 Monat = 28./29.02.
create or replace function set_next_due_after_inspection()
returns trigger
language plpgsql
as $$
begin
    if new.result in ('passed', 'passed_with_defects') then
        update devices
        set next_due_date = (new.inspected_at + make_interval(months => interval_months))::date
        where id = new.device_id;
    end if;
    return new;
end;
$$;

create trigger inspections_set_next_due
    after insert on inspections
    for each row execute function set_next_due_after_inspection();

alter table inspections enable row level security;

create policy inspections_select on inspections
    for select using (company_id = current_company_id());
-- Insert nur für eigene Geräte: verhindert Historie-Einträge, die auf fremde Geräte zeigen.
create policy inspections_insert on inspections
    for insert with check (
        company_id = current_company_id()
        and exists (
            select 1 from devices d
            where d.id = device_id
              and d.company_id = current_company_id()
        )
    );

-- Privater Storage-Bucket für Prüfnachweise. Pfadkonvention: {company_id}/{device_id}/{uuid}.pdf
-- Hinweis: Policies auf storage.objects erfordern die postgres-Rolle (Supabase-SQL-Editor).
insert into storage.buckets (id, name, public)
values ('inspection-docs', 'inspection-docs', false)
on conflict (id) do nothing;

create policy inspection_docs_select on storage.objects
    for select using (
        bucket_id = 'inspection-docs'
        and (storage.foldername(name))[1] = current_company_id()::text
    );
create policy inspection_docs_insert on storage.objects
    for insert with check (
        bucket_id = 'inspection-docs'
        and (storage.foldername(name))[1] = current_company_id()::text
    );
create policy inspection_docs_delete on storage.objects
    for delete using (
        bucket_id = 'inspection-docs'
        and (storage.foldername(name))[1] = current_company_id()::text
    );
