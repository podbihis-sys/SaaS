-- VPE-Art pro Produkt (im CMS wählbar): NULL = automatisch aus der
-- Größentabelle abgeleitet; sonst rolle / laenge / rolle_laenge / meterware.
alter table bit_products
  add column if not exists vpe_type text;

alter table bit_products
  drop constraint if exists bit_products_vpe_type_check;
alter table bit_products
  add constraint bit_products_vpe_type_check
  check (vpe_type is null or vpe_type in ('rolle', 'laenge', 'rolle_laenge', 'meterware'));

-- Kundenvorgabe (Produktänderungen): diese Artikel sind Längenware á 1,22 m …
update bit_products set vpe_type = 'laenge' where slug in (
  'schrumpfschlauch-ptfe-400-teflon-4-1',
  'schrumpfschlauch-uv-bestaendig-bpmw',
  'schrumpfschlauch-mittelwandig-mit-kleber-bpmw-a',
  'schrumpfschlauch-dickwandig-bptw-a'
);

-- … und diese Rollenware, jede Größe zusätzlich als 1,22-m-Länge erhältlich.
update bit_products set vpe_type = 'rolle_laenge' where slug in (
  'dickwandiger-schrumpfschlauch-bptw',
  'schrumpfschlauch-mit-kleber-bpdw-100',
  'schrumpfschlauch-mit-kleber-bpdw-102',
  'schrumpfschlauch-4-1'
);
