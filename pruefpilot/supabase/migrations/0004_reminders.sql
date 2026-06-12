create table reminder_log (
    id uuid primary key default gen_random_uuid(),
    device_id uuid not null references devices (id) on delete cascade,
    company_id uuid not null references companies (id) on delete cascade,
    stage text not null check (stage in ('d60', 'd30', 'd7', 'overdue')),
    due_date date not null,
    sent_at timestamptz not null default now(),
    -- Idempotenz: je Gerät, Stufe und Fälligkeitsdatum höchstens eine Erinnerung.
    unique (device_id, stage, due_date)
);

create index reminder_log_company_idx on reminder_log (company_id);
create index reminder_log_device_idx on reminder_log (device_id, due_date);

alter table reminder_log enable row level security;

create policy reminder_log_select on reminder_log
    for select using (company_id = current_company_id());
-- Bewusst keine insert/update/delete-Policies für authenticated:
-- Einträge schreibt ausschließlich der Cron-Job über den Service-Role-Client (RLS-Bypass).
