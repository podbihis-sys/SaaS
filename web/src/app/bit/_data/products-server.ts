import { query, queryOne, parseJsonColumn } from "@/app/bit/_lib/db";
import { withTimeout } from "@/app/bit/_lib/with-timeout";
import { bitImageUrl } from "./cms";
import {
  CATEGORIES,
  CATEGORY_IMAGE,
  PRODUCTS,
  type Category,
  type CategoryId,
  type Product,
} from "./catalog";

/**
 * Datenzugriff für den Produktkatalog (CMS-first, MariaDB).
 *
 * Veröffentlichte Kategorien und Produkte aus der Datenbank überschreiben die
 * im Code hinterlegten Fallbacks (per id/slug) und ergänzen neue Einträge –
 * damit wirkt jede Änderung im Admin ohne Deploy. Ist die Datenbank leer
 * oder langsam, liefert der Fallback weiterhin die komplette Website.
 *
 * Oeffentliche Reads: nur status='published' (ersetzt die fruehere RLS).
 */

interface CategoryRow {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  image_path: string | null;
  sort_order: number;
}

interface ProductRow {
  slug: string;
  category_id: string;
  code: string;
  name: string;
  tagline: string | null;
  description: string;
  material: string | null;
  temperature: string | null;
  unit: string;
  vpe_type: string | null;
  sizes: unknown;
  colors: unknown;
  features: unknown;
  applications: unknown;
  tech: unknown;
  datasheet_url: string | null;
  image_path: string | null;
  image_alt: string | null;
  sort_order: number;
}

export interface CatalogData {
  categories: Category[];
  products: Product[];
  /** Kategorie-Bild (DB-Wert vor statischem Fallback). */
  categoryImage: Record<string, string>;
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id as CategoryId,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
  };
}

function mapProduct(row: ProductRow): Product {
  const sizes = parseJsonColumn<string[]>(row.sizes, []);
  return {
    slug: row.slug,
    code: row.code,
    category: row.category_id as CategoryId,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description,
    image: bitImageUrl(row.image_path) ?? "/bit/logo.png",
    imageAlt: row.image_alt ?? row.name,
    sizes: sizes.length ? sizes : ["Standardausführung"],
    unit: (["Meter", "Stück", "Beutel (100 St.)"].includes(row.unit) ? row.unit : "Stück") as Product["unit"],
    vpeType: (["rolle", "laenge", "rolle_laenge", "meterware"].includes(row.vpe_type ?? "")
      ? row.vpe_type
      : PRODUCTS.find((p) => p.slug === row.slug)?.vpeType) as Product["vpeType"],
    colors: parseJsonColumn<string[]>(row.colors, []),
    material: row.material ?? "",
    temperature: row.temperature ?? undefined,
    tech: parseJsonColumn<{ label: string; value: string }[]>(row.tech, []),
    features: parseJsonColumn<string[]>(row.features, []),
    applications: parseJsonColumn<string[]>(row.applications, []),
    datasheet: row.datasheet_url ?? undefined,
  };
}

const FALLBACK: CatalogData = {
  categories: CATEGORIES,
  products: PRODUCTS,
  categoryImage: CATEGORY_IMAGE,
};

const PRODUCT_COLS =
  "slug,category_id,code,name,tagline,description,material,temperature,unit,vpe_type,sizes,colors,features,applications,tech,datasheet_url,image_path,image_alt,sort_order";

/** Kompletter Katalog: CMS-Zeilen überschreiben Fallbacks, Neue kommen dazu. */
export async function getCatalog(): Promise<CatalogData> {
  return withTimeout<CatalogData>(async () => {
    const [cats, prods] = await Promise.all([
      query<CategoryRow>(
        "SELECT id,name,tagline,description,image_path,sort_order FROM bit_categories ORDER BY sort_order",
      ),
      query<ProductRow>(
        `SELECT ${PRODUCT_COLS} FROM bit_products WHERE status = 'published' ORDER BY sort_order`,
      ),
    ]);
    if (!cats.length || !prods.length) return FALLBACK;
    const categories = cats.map(mapCategory);
    const products = prods.map(mapProduct);
    const categoryImage: Record<string, string> = {};
    for (const row of cats) {
      const dbImage = bitImageUrl(row.image_path);
      const firstProduct = products.find((p) => p.category === row.id)?.image;
      const img = dbImage ?? CATEGORY_IMAGE[row.id as CategoryId] ?? firstProduct;
      if (img) categoryImage[row.id] = img;
    }
    return { categories, products, categoryImage };
  }, FALLBACK);
}

/** Einzelnes Produkt (CMS-first, Fallback statisch). */
export async function getCmsProduct(slug: string): Promise<Product | undefined> {
  const fallback = PRODUCTS.find((p) => p.slug === slug);
  return withTimeout<Product | undefined>(async () => {
    const row = await queryOne<ProductRow>(
      `SELECT ${PRODUCT_COLS} FROM bit_products WHERE slug = ? AND status = 'published' LIMIT 1`,
      [slug],
    );
    if (!row) return fallback;
    return mapProduct(row);
  }, fallback);
}
