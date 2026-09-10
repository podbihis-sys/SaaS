import { createPublicClient } from "@/app/bit/_lib/supabase-public";
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
 * Datenzugriff für den Produktkatalog (CMS-first).
 *
 * Veröffentlichte Kategorien und Produkte aus Supabase überschreiben die im
 * Code hinterlegten Fallbacks (per id/slug) und ergänzen neue Einträge –
 * damit wirkt jede Änderung im Admin ohne Deploy. Ist die Datenbank leer
 * oder langsam, liefert der Fallback weiterhin die komplette Website.
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
  sizes: string[];
  colors: string[];
  features: string[];
  applications: string[];
  tech: { label: string; value: string }[];
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
  return {
    slug: row.slug,
    code: row.code,
    category: row.category_id as CategoryId,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description,
    image: bitImageUrl(row.image_path) ?? "/bit/logo.png",
    imageAlt: row.image_alt ?? row.name,
    sizes: row.sizes.length ? row.sizes : ["Standardausführung"],
    unit: (["Meter", "Stück", "Beutel (100 St.)"].includes(row.unit) ? row.unit : "Stück") as Product["unit"],
    vpeType: (["rolle", "laenge", "rolle_laenge", "meterware"].includes(row.vpe_type ?? "")
      ? row.vpe_type
      : PRODUCTS.find((p) => p.slug === row.slug)?.vpeType) as Product["vpeType"],
    colors: row.colors,
    material: row.material ?? "",
    temperature: row.temperature ?? undefined,
    tech: row.tech ?? [],
    features: row.features,
    applications: row.applications,
    datasheet: row.datasheet_url ?? undefined,
  };
}

const FALLBACK: CatalogData = {
  categories: CATEGORIES,
  products: PRODUCTS,
  categoryImage: CATEGORY_IMAGE,
};

/** Kompletter Katalog: CMS-Zeilen überschreiben Fallbacks, Neue kommen dazu. */
export async function getCatalog(): Promise<CatalogData> {
  return withTimeout<CatalogData>(async () => {
    const supabase = createPublicClient();
    const [cats, prods] = await Promise.all([
      supabase.from("bit_categories").select("*").order("sort_order").returns<CategoryRow[]>(),
      supabase
        .from("bit_products")
        .select(
          "slug,category_id,code,name,tagline,description,material,temperature,unit,vpe_type,sizes,colors,features,applications,tech,datasheet_url,image_path,image_alt,sort_order",
        )
        .order("sort_order")
        .returns<ProductRow[]>(),
    ]);
    if (cats.error || prods.error || !cats.data?.length || !prods.data?.length) {
      return FALLBACK;
    }
    const categories = cats.data.map(mapCategory);
    const products = prods.data.map(mapProduct);
    const categoryImage: Record<string, string> = {};
    for (const row of cats.data) {
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
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("bit_products")
      .select(
        "slug,category_id,code,name,tagline,description,material,temperature,unit,sizes,colors,features,applications,tech,datasheet_url,image_path,image_alt,sort_order",
      )
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return fallback;
    return mapProduct(data as unknown as ProductRow);
  }, fallback);
}
