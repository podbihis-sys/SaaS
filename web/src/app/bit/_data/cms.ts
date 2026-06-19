import { createClient } from "@/app/bit/_lib/supabase-server";
import {
  CATEGORIES,
  CATEGORY_IMAGE,
  PRODUCTS,
  type Category,
  type CategoryId,
  type Product,
} from "./catalog";

/**
 * Datenzugriffsschicht des BIT-CMS.
 *
 * Liest Produkte/Kategorien aus Supabase (Tabellen aus 0003_bit_cms.sql) und
 * mappt sie auf den bestehenden `Product`/`Category`-Vertrag. Solange die
 * Tabellen leer/nicht vorhanden sind (vor Migration + Seed), fällt alles
 * sauber auf die statischen Daten aus `catalog.ts` zurück – die Seite
 * funktioniert also in jeder Phase.
 */

const BUCKET = "bit-product-images";

export function bitImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${path}` : undefined;
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
  sizes: string[] | null;
  colors: string[] | null;
  features: string[] | null;
  applications: string[] | null;
  tech: { label: string; value: string }[] | null;
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
    sizes: row.sizes ?? [],
    colors: row.colors && row.colors.length > 0 ? row.colors : undefined,
    features: row.features ?? [],
    applications: row.applications ?? [],
    tech: row.tech ?? [],
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

/** Veröffentlichte Produkte (öffentliche Seite) – Fallback: statischer Katalog. */
export async function getCmsProducts(
  opts: { includeDrafts?: boolean } = {},
): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("bit_products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (!opts.includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query.returns<ProductRow[]>();
    if (error || !data || data.length === 0) return PRODUCTS;
    return data.map(mapProduct);
  } catch {
    return PRODUCTS;
  }
}

export async function getCmsProduct(slug: string): Promise<Product | undefined> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bit_products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return PRODUCTS.find((p) => p.slug === slug);
    return mapProduct(data as unknown as ProductRow);
  } catch {
    return PRODUCTS.find((p) => p.slug === slug);
  }
}

export async function getCmsCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bit_categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .returns<CategoryRow[]>();
    if (error || !data || data.length === 0) return CATEGORIES;
    return data.map(mapCategory);
  } catch {
    return CATEGORIES;
  }
}
