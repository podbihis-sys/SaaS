insert into companies (id, name, slug, legal_name, tax_id, address_line1, postal_code, city, country, email)
values (
    '00000000-0000-0000-0000-000000000001',
    'Musterbetrieb',
    'musterbetrieb',
    'Musterbetrieb GmbH',
    'DE123456789',
    'Musterstraße 1',
    '10115',
    'Berlin',
    'DE',
    'info@musterbetrieb.de'
) on conflict (id) do nothing;

insert into company_settings (company_id, vat_rate, currency, quote_number_prefix, quote_number_counter, bank_name, iban, bic, locale)
values (
    '00000000-0000-0000-0000-000000000001',
    0.1900,
    'EUR',
    'AN-',
    1000,
    'Sparkasse Berlin',
    'DE89370400440532013000',
    'COBADEFFXXX',
    'de-DE'
) on conflict (company_id) do nothing;

insert into price_lists (id, company_id, name, is_default, currency)
values (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'Standardliste',
    true,
    'EUR'
) on conflict (id) do nothing;

insert into price_items (company_id, price_list_id, key, label, kind, unit, unit_price, currency) values
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','labor_hour','Arbeitsstunde Geselle','labor','h',65.0000,'EUR'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','helper_hour','Helferstunde','labor','h',45.0000,'EUR'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','paint_wall','Wand streichen','area','m2',12.5000,'EUR'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','tile_floor','Boden fliesen','area','m2',85.0000,'EUR'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','plaster_wall','Wand verputzen','area','m2',38.0000,'EUR'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','paint_white','Wandfarbe weiß','material','kg',4.2000,'EUR'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','tile_30x30','Fliese 30x30','material','pcs',2.3000,'EUR'),
('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','disposal','Entsorgung','flat','pcs',120.0000,'EUR')
on conflict (price_list_id, key) do nothing;

insert into customers (id, company_id, full_name, email, phone, address_line1, postal_code, city, country) values
('00000000-0000-0000-0000-000000000100','00000000-0000-0000-0000-000000000001','Anna Beispiel','anna@example.com','+49 30 1234567','Beispielweg 5','10115','Berlin','DE')
on conflict (id) do nothing;
