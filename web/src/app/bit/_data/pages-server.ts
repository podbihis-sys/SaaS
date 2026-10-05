import { query, queryOne } from "@/app/bit/_lib/db";
import { withTimeout } from "@/app/bit/_lib/with-timeout";
import { CONTENT_PAGES, getContentPage, type ContentPage } from "./pages";

/**
 * Unterseiten (CMS-first, MariaDB): veröffentlichte Zeilen aus `bit_pages`
 * überschreiben die im Code importierten Originalseiten (per Slug); Fallback
 * bleibt die statische Liste, damit die Website ohne Datenbank vollständig ist.
 *
 * Oeffentliche Reads: nur status='published' (ersetzt die fruehere RLS).
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
    const row = await queryOne<PageRow>(
      "SELECT slug,title,meta_title,meta_description,body FROM bit_pages WHERE slug = ? AND status = 'published' LIMIT 1",
      [slug],
    );
    if (!row) return fallback;
    return mapPage(row);
  }, fallback);
}

export async function getCmsPages(): Promise<ContentPage[]> {
  return withTimeout<ContentPage[]>(async () => {
    const rows = await query<PageRow>(
      "SELECT slug,title,meta_title,meta_description,body FROM bit_pages WHERE status = 'published'",
    );
    if (rows.length === 0) return CONTENT_PAGES;
    const bySlug = new Map(CONTENT_PAGES.map((p) => [p.slug, p]));
    for (const row of rows) bySlug.set(row.slug, mapPage(row));
    return [...bySlug.values()];
  }, CONTENT_PAGES);
}
