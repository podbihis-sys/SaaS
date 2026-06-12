create or replace function current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
    select c.id
    from companies c
    where c.owner_id = auth.uid();
$$;

revoke all on function current_company_id() from public;
grant execute on function current_company_id() to authenticated;

alter table companies enable row level security;
alter table device_categories enable row level security;
alter table devices enable row level security;

create policy companies_select on companies
    for select using (owner_id = auth.uid());
create policy companies_insert on companies
    for insert with check (owner_id = auth.uid());
create policy companies_update on companies
    for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
-- bewusst keine companies_delete-Policy: Kontolöschung läuft in V1 über Support

create policy device_categories_select on device_categories
    for select to authenticated using (true);

create policy devices_select on devices
    for select using (company_id = current_company_id());
create policy devices_insert on devices
    for insert with check (company_id = current_company_id());
create policy devices_update on devices
    for update using (company_id = current_company_id())
    with check (company_id = current_company_id());
create policy devices_delete on devices
    for delete using (company_id = current_company_id());
