# BIT CMS – Self-Service-Produktpflege

Ziel: Der Kunde pflegt den `/bit`-Produktkatalog (Bilder, Größen, Beschreibung,
technische Daten, Einheit/Material, **neue Produkte/Kategorien**) selbstständig
über ein geschütztes Admin – ohne Code und ohne Deploy.

Architektur: **eigenes Admin auf der vorhandenen Supabase** (Postgres + Auth +
Storage). Rollen-/Einladungssystem (`admin`, `editor`). Einmandantig, bewusst
getrennt von den `company_id`-Tabellen der SaaS-App.

## Datenmodell (Migration `supabase/migrations/0003_bit_cms.sql`)

| Tabelle | Zweck |
| --- | --- |
| `bit_categories` | Kategorien (id, name, tagline, description, image_path, sort_order) |
| `bit_products` | Produkte – alle Felder des bisherigen `Product`-Typs (slug, code, name, tagline, description, material, temperature, unit, `sizes[]`, `colors[]`, `features[]`, `applications[]`, `tech jsonb`, datasheet_url, image_path, image_alt, `status` draft/published, sort_order) |
| `bit_admins` | Wer darf ins CMS (user_id → auth.users, role) |
| `bit_admin_invites` | Einladungen (email, role, token, expires_at) |
| Storage-Bucket `bit-product-images` | Produktbilder & Datenblätter (öffentlich lesbar, Schreiben nur Admin) |

RLS: Öffentlich nur `status='published'` lesbar; Schreiben nur für Admins
(`bit_is_admin()`). Einladung annehmen über die SECURITY-DEFINER-Funktion
`bit_accept_invite(token)`.

## 1. Migration anwenden

```bash
# Variante A: Supabase CLI (empfohlen)
supabase db push

# Variante B: SQL aus 0003_bit_cms.sql im Supabase-Dashboard (SQL Editor) ausführen
```

## 2. Ersten Admin festlegen (Bootstrap)

Der Kunde registriert/loggt sich einmal über die normale Anmeldung ein, danach
(als Service-Role im SQL-Editor):

```sql
insert into bit_admins (user_id, email, role)
select id, email, 'admin' from auth.users where email = 'KUNDE@FIRMA.de'
on conflict (user_id) do update set role = 'admin';
```

Weitere Bearbeiter lädt dieser Admin anschließend im CMS per E-Mail ein
(`editor` oder `admin`).

## 3. Bestandsdaten übernehmen (Seed)

Die 136 echten Produkte aus `web/src/app/bit/_data/catalog.ts` und die Bilder
aus `web/public/bit/products/` werden einmalig in DB + Storage übernommen
(Seed-Skript, Increment 2). Bis zum Cutover bleibt `catalog.ts` als Fallback
aktiv, sodass die Seite jederzeit funktioniert.

## Status & nächste Schritte

- [x] **Increment 1 – Fundament:** Migration (Schema, RLS, Rollen, Einladungen, Storage). *(dieser Stand)*
- [ ] **Increment 2 – Datenzugriff & Cutover:** `_data/cms.ts` (Supabase-Lesen → `Product`/`Category`, Fallback auf `catalog.ts`); Seed-Skript aus `catalog.ts`; öffentliche Seiten (`produkte`, `produkte/[slug]`, Home) auf DB + On-Demand-Revalidation (`revalidateTag`).
- [ ] **Increment 3 – Admin-UI:** geschützter Bereich `/bit/admin` (Login + Rollencheck), Produktliste, Anlegen/Bearbeiten-Formular mit Größen- und Tech-Daten-Editor, Bild-/PDF-Upload (Storage), Entwurf/Veröffentlichen, Kategorie- und Benutzer-/Einladungsverwaltung.
- [ ] **Increment 4 – Abnahme:** Build/Typecheck grün, Kurzanleitung für den Kunden, Deploy.
