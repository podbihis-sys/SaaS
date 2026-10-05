import { query, queryOne, parseJsonColumn } from "@/app/bit/_lib/db";
import {
  CATEGORIES,
  CATEGORY_IMAGE,
  PRODUCTS,
  type Category,
  type CategoryId,
  type Product,
} from "./catalog";

/**
 * Datenzugriffsschicht des BIT-CMS (MariaDB).
 *
 * Liest Produkte/Kategorien aus der Datenbank und mappt sie auf den
 * bestehenden `Product`/`Category`-Vertrag. Solange die Tabellen leer/nicht
 * vorhanden sind (vor Migration + Seed) oder die DB nicht erreichbar ist,
 * faellt alles sauber auf die statischen Daten aus `catalog.ts` zurueck – die
 * Seite funktioniert also in jeder Phase.
 */

/**
 * Bild-URL aufloesen. Relative Keys (products/…, news/…, categories/…) werden
 * ueber die lokale Media-Route ausgeliefert; absolute (http) und bereits
 * absolute Pfade (/bit/…) bleiben unveraendert.
 */
export function bitImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/bit/media/${path}`;
}

interface ProductRow {
  id: string;
  slug: string;
  category_id: string;
  code: string | null;
  name: string;
  tagline: string | null;
  description: string | null;
  material: string | null;
  temperature: string | null;
  unit: string;
  sizes: unknown;
  colors: unknown;
  features: unknown;
  applications: unknown;
  tech: unknown;
  datasheet_url: string | null;
  image_path: string | null;
  image_alt: string | null;
  status: "draft" | "published";
}

interface CategoryRow {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
}

function mapProduct(row: ProductRow): Product {
  const category = row.category_id as CategoryId;
  const colors = parseJsonColumn<string[]>(row.colors, []);
  return {
    slug: row.slug,
    category,
    code: row.code || row.name,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    material: row.material ?? "",
    temperature: row.temperature ?? undefined,
    unit: row.unit as Product["unit"],
    sizes: parseJsonColumn<string[]>(row.sizes, []),
    colors: colors.length > 0 ? colors : undefined,
    features: parseJsonColumn<string[]>(row.features, []),
    applications: parseJsonColumn<string[]>(row.applications, []),
    tech: parseJsonColumn<{ label: string; value: string }[]>(row.tech, []),
    datasheet: row.datasheet_url ?? undefined,
    image: bitImageUrl(row.image_path) ?? CATEGORY_IMAGE[category],
    imageAlt: row.image_alt ?? row.name,
  };
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id as CategoryId,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
  };
}

const PRODUCT_COLS =
  "id,slug,category_id,code,name,tagline,description,material,temperature,unit,vpe_type,sizes,colors,features,applications,tech,datasheet_url,image_path,image_alt,status";

/** Veröffentlichte Produkte (öffentliche Seite) – Fallback: statischer Katalog. */
export async function getCmsProducts(
  opts: { includeDrafts?: boolean } = {},
): Promise<Product[]> {
  try {
    const where = opts.includeDrafts ? "" : " WHERE status = 'published'";
    const rows = await query<ProductRow>(
      `SELECT ${PRODUCT_COLS} FROM bit_products${where} ORDER BY sort_order ASC, name ASC`,
    );
    if (rows.length === 0) return PRODUCTS;
    return rows.map(mapProduct);
  } catch {
    return PRODUCTS;
  }
}

export async function getCmsProduct(slug: string): Promise<Product | undefined> {
  try {
    const row = await queryOne<ProductRow>(
      `SELECT ${PRODUCT_COLS} FROM bit_products WHERE slug = ? AND status = 'published' LIMIT 1`,
      [slug],
    );
    if (!row) return PRODUCTS.find((p) => p.slug === slug);
    return mapProduct(row);
  } catch {
    return PRODUCTS.find((p) => p.slug === slug);
  }
}

export async function getCmsCategories(): Promise<Category[]> {
  try {
    const rows = await query<CategoryRow>(
      "SELECT id,name,tagline,description FROM bit_categories ORDER BY sort_order ASC",
    );
    if (rows.length === 0) return CATEGORIES;
    return rows.map(mapCategory);
  } catch {
    return CATEGORIES;
  }
}
