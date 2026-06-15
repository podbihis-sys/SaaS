import { createClient } from "@/app/bit/_lib/supabase-server";
import { bitImageUrl } from "./cms";
import { NEWS, type NewsPost } from "./news";

/**
 * Datenzugriff für News-Beiträge.
 *
 * Liest veröffentlichte Beiträge aus der Tabelle `bit_news` (siehe
 * 0004_bit_news.sql) und fällt – solange die Tabelle leer/nicht vorhanden ist –
 * sauber auf die statische Liste aus `news.ts` zurück. Die Seite funktioniert
 * damit in jeder Phase (vor Migration + Seed wie danach).
 */

interface NewsRow {
  id: string;
  slug: string;
  title: string;
  published_at: string | null;
  excerpt: string | null;
  body: string | null;
  image_path: string | null;
  image_alt: string | null;
  status: "draft" | "published";
}

function mapNews(row: NewsRow): NewsPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.published_at ?? "",
    excerpt: row.excerpt ?? "",
    body: row.body ?? "",
    image: bitImageUrl(row.image_path) ?? "/bit/logo.png",
    imageAlt: row.image_alt ?? row.title,
  };
}

/** Veröffentlichte Beiträge, neueste zuerst – Fallback: statische Liste. */
export async function getCmsNews(
  opts: { includeDrafts?: boolean } = {},
): Promise<NewsPost[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("bit_news")
      .select("*")
      .order("published_at", { ascending: false });
    if (!opts.includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query.returns<NewsRow[]>();
    if (error || !data || data.length === 0) return NEWS;
    return data.map(mapNews);
  } catch {
    return NEWS;
  }
}

export async function getCmsNewsPost(slug: string): Promise<NewsPost | undefined> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bit_news")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return NEWS.find((n) => n.slug === slug);
    return mapNews(data as unknown as NewsRow);
  } catch {
    return NEWS.find((n) => n.slug === slug);
  }
}
