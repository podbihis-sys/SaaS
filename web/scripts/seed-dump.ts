// Dumps the static BIT catalog as idempotent SQL upserts for the bit-gmbh
// Supabase instance. Run: npx tsx scripts/seed-dump.ts > /tmp/seed.sql
import {
  CATEGORIES,
  CATEGORY_IMAGE,
  PRODUCTS,
} from "../src/app/bit/_data/catalog";

function s(v: unknown): string {
  if (v === null || v === undefined || v === "") return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}
function arr(a?: readonly string[]): string {
  if (!a || a.length === 0) return "ARRAY[]::text[]";
  return `ARRAY[${a.map((x) => `'${x.replace(/'/g, "''")}'`).join(",")}]::text[]`;
}
function jsonb(o: unknown): string {
  return `'${JSON.stringify(o ?? []).replace(/'/g, "''")}'::jsonb`;
}

const out: string[] = ["begin;"];

CATEGORIES.forEach((c, i) => {
  out.push(
    `insert into bit_categories (id,name,tagline,description,image_path,sort_order) values (` +
      `${s(c.id)},${s(c.name)},${s(c.tagline)},${s(c.description)},${s(CATEGORY_IMAGE[c.id])},${i}) ` +
      `on conflict (id) do update set name=excluded.name,tagline=excluded.tagline,` +
      `description=excluded.description,image_path=excluded.image_path,sort_order=excluded.sort_order;`,
  );
});

PRODUCTS.forEach((p, i) => {
  out.push(
    `insert into bit_products (slug,category_id,code,name,tagline,description,material,temperature,unit,` +
      `sizes,colors,features,applications,tech,datasheet_url,image_path,image_alt,status,sort_order) values (` +
      `${s(p.slug)},${s(p.category)},${s(p.code ?? "")},${s(p.name)},${s(p.tagline)},${s(p.description)},` +
      `${s(p.material)},${s(p.temperature)},${s(p.unit ?? "Stück")},${arr(p.sizes)},${arr(p.colors)},` +
      `${arr(p.features)},${arr(p.applications)},${jsonb(p.tech)},${s(p.datasheet)},${s(p.image)},` +
      `${s(p.imageAlt ?? p.name)},'published',${i}) ` +
      `on conflict (slug) do update set category_id=excluded.category_id,code=excluded.code,name=excluded.name,` +
      `tagline=excluded.tagline,description=excluded.description,material=excluded.material,` +
      `temperature=excluded.temperature,unit=excluded.unit,sizes=excluded.sizes,colors=excluded.colors,` +
      `features=excluded.features,applications=excluded.applications,tech=excluded.tech,` +
      `datasheet_url=excluded.datasheet_url,image_path=excluded.image_path,image_alt=excluded.image_alt;`,
  );
});

out.push("commit;");
console.log(out.join("\n"));
