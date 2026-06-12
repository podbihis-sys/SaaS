-- Standard-Prüfintervalle sind EMPFEHLUNGEN und je Betrieb anpassbar.
-- DGUV-V3-Intervalle sind risikoabhängig (6–24 Monate) — fachliche Prüfung vor Launch (siehe PRD, offene Fragen).
insert into device_categories (id, name_de, legal_basis, default_interval_months, sort) values
    ('dguv_v3_portable', 'Elektrogerät (ortsveränderlich)', 'DGUV Vorschrift 3 / VDE 0701-0702', 12, 10),
    ('dguv_v3_fixed', 'Elektroanlage (ortsfest)', 'DGUV Vorschrift 3 / VDE 0105-100', 48, 20),
    ('ladder', 'Leiter / Tritt', 'DGUV Information 208-016', 12, 30),
    ('fire_extinguisher', 'Feuerlöscher', 'DIN 14406-4 / ASR A2.2', 24, 40),
    ('first_aid', 'Erste-Hilfe-Material', 'DGUV Vorschrift 1 / DIN 13157', 12, 50),
    ('uvv_vehicle', 'Fahrzeug (UVV)', 'DGUV Vorschrift 70', 12, 60),
    ('uvv_forklift', 'Flurförderzeug (UVV)', 'DGUV Vorschrift 68', 12, 70)
on conflict (id) do update set
    name_de = excluded.name_de,
    legal_basis = excluded.legal_basis,
    default_interval_months = excluded.default_interval_months,
    sort = excluded.sort;
