insert into companies (id, name, address, vat_id, default_vat_rate)
values (
    '00000000-0000-0000-0000-000000000001',
    'Musterbetrieb GmbH',
    'Musterstraße 1, 10115 Berlin',
    'DE123456789',
    0.19
) on conflict (id) do nothing;

insert into company_settings (company_id, currency, locale, signature_block, footer)
values (
    '00000000-0000-0000-0000-000000000001',
    'EUR',
    'de-DE',
    'Mit freundlichen Grüßen, Musterbetrieb GmbH',
    'Musterbetrieb GmbH · Musterstraße 1 · 10115 Berlin · DE123456789'
) on conflict (company_id) do nothing;

insert into price_lists (id, company_id, name, is_default)
values (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'Standardliste',
    true
) on conflict (id) do nothing;

insert into price_items (company_id, price_list_id, kind, key, label, unit, price) values
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','labor','labor_hour','Arbeitsstunde','h',65.00),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','labor','helper_hour','Helferstunde','h',45.00),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','area','paint_wall','Wand streichen','m2',12.50),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','area','tile_floor','Boden fliesen','m2',85.00),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','material','paint_white','Wandfarbe weiß','kg',4.20),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','material','tile_30x30','Fliese 30x30','pcs',2.30)
on conflict (price_list_id, key) do nothing;

insert into customers (id, company_id, name, email, phone, address) values
('00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000001','Anna Beispiel','anna@example.com','+49 30 1234567','Beispielweg 5, 10115 Berlin')
on conflict (id) do nothing;
