import { createPublicClient } from "@/app/bit/_lib/supabase-public";
import { withTimeout } from "@/app/bit/_lib/with-timeout";
import { CONTENT_PAGES, getContentPage, type ContentPage } from "./pages";

/**
 * Unterseiten (CMS-first): veröffentlichte Zeilen aus `bit_pages` überschreiben
 * die im Code importierten Originalseiten (per Slug); Fallback bleibt die
 * statische Liste, damit die Website ohne Datenbank vollständig ist.
 */

interface PageRow {
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  body: string;
}

function mapPage(row: PageRow): ContentPage {
  return {
    slug: row.slug,
    title: row.title,
    metaTitle: row.meta_title ?? row.title,
    metaDescription: row.meta_description ?? "",
    body: row.body,
    source: "cms",
  };
}

export async function getCmsPage(slug: string): Promise<ContentPage | undefined> {
  const fallback = getContentPage(slug);
  return withTimeout<ContentPage | undefined>(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("bit_pages")
      .select("slug,title,meta_title,meta_description,body")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return fallback;
    return mapPage(data as unknown as PageRow);
  }, fallback);
}

export async function getCmsPages(): Promise<ContentPage[]> {
  return withTimeout<ContentPage[]>(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("bit_pages")
      .select("slug,title,meta_title,meta_description,body")
      .returns<PageRow[]>();
    if (error || !data || data.length === 0) return CONTENT_PAGES;
    const bySlug = new Map(CONTENT_PAGES.map((p) => [p.slug, p]));
    for (const row of data) bySlug.set(row.slug, mapPage(row));
    return [...bySlug.values()];
  }, CONTENT_PAGES);
}
