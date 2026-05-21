create or replace function auth_has_company(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from memberships m
        where m.company_id = target_company_id
          and m.user_id = auth.uid()
    );
$$;

revoke all on function auth_has_company(uuid) from public;
grant execute on function auth_has_company(uuid) to authenticated;

alter table companies enable row level security;
alter table memberships enable row level security;
alter table customers enable row level security;
alter table inquiries enable row level security;
alter table inquiry_images enable row level security;
alter table ai_analyses enable row level security;
alter table price_lists enable row level security;
alter table price_items enable row level security;
alter table quotes enable row level security;
alter table quote_positions enable row level security;
alter table company_settings enable row level security;

create policy companies_select on companies
    for select using (auth_has_company(id));
create policy companies_modify on companies
    for all using (auth_has_company(id)) with check (auth_has_company(id));

create policy memberships_select_self on memberships
    for select using (
        user_id = auth.uid()
        or exists (
            select 1 from memberships m2
            where m2.company_id = memberships.company_id
              and m2.user_id = auth.uid()
              and m2.role in ('owner','admin')
        )
    );
create policy memberships_modify_admin on memberships
    for all using (
        exists (
            select 1 from memberships m2
            where m2.company_id = memberships.company_id
              and m2.user_id = auth.uid()
              and m2.role in ('owner','admin')
        )
    ) with check (
        exists (
            select 1 from memberships m2
            where m2.company_id = memberships.company_id
              and m2.user_id = auth.uid()
              and m2.role in ('owner','admin')
        )
    );

create policy customers_tenant on customers
    for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));

create policy inquiries_tenant on inquiries
    for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));

create policy inquiry_images_tenant on inquiry_images
    for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));

create policy ai_analyses_tenant on ai_analyses
    for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));

create policy price_lists_tenant on price_lists
    for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));

create policy price_items_tenant on price_items
    for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));

create policy quotes_tenant on quotes
    for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));

create policy quote_positions_tenant on quote_positions
    for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));

create policy company_settings_tenant on company_settings
    for all using (auth_has_company(company_id)) with check (auth_has_company(company_id));
