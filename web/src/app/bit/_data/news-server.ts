import { createPublicClient } from "@/app/bit/_lib/supabase-public";
import { withTimeout } from "@/app/bit/_lib/with-timeout";
import { bitImageUrl } from "./cms";
import { NEWS, type NewsPost } from "./news";
import { NEWS_EN } from "./news-en";

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
  title_en?: string | null;
  excerpt_en?: string | null;
  body_en?: string | null;
}

/** Englische Felder ergänzen: CMS-Spalten zuerst, sonst die Übersetzung aus news-en.ts. */
function withEn(post: NewsPost, row?: NewsRow): NewsPost {
  const en = NEWS_EN[post.slug];
  return {
    ...post,
    titleEn: row?.title_en || post.titleEn || en?.title,
    excerptEn: row?.excerpt_en || post.excerptEn || en?.excerpt,
    bodyEn: row?.body_en || post.bodyEn || en?.body,
  };
}

function mapNews(row: NewsRow): NewsPost {
  return withEn(
    {
      slug: row.slug,
      title: row.title,
      date: row.published_at ?? "",
      excerpt: row.excerpt ?? "",
      body: row.body ?? "",
      image: bitImageUrl(row.image_path) ?? "/bit/logo.png",
      imageAlt: row.image_alt ?? row.title,
    },
    row,
  );
}

const NEWS_WITH_EN = NEWS.map((n) => withEn(n));

/** Beitrag in der gewünschten Sprache (EN fällt je Feld auf Deutsch zurück). */
export function localizeNews(post: NewsPost, locale: "de" | "en"): NewsPost {
  if (locale === "de") return post;
  return {
    ...post,
    title: post.titleEn || post.title,
    excerpt: post.excerptEn || post.excerpt,
    body: post.bodyEn || post.body,
    imageAlt: post.titleEn || post.imageAlt,
  };
}

/** Veröffentlichte Beiträge, neueste zuerst – Fallback: statische Liste. */
export async function getCmsNews(
  opts: { includeDrafts?: boolean } = {},
): Promise<NewsPost[]> {
  return withTimeout<NewsPost[]>(async () => {
    const supabase = createPublicClient();
    let query = supabase
      .from("bit_news")
      .select("*")
      .order("published_at", { ascending: false });
    if (!opts.includeDrafts) query = query.eq("status", "published");
    const { data, error } = await query.returns<NewsRow[]>();
    if (error || !data || data.length === 0) return NEWS_WITH_EN;
    return data.map(mapNews);
  }, NEWS_WITH_EN);
}

export async function getCmsNewsPost(slug: string): Promise<NewsPost | undefined> {
  const fallback = NEWS_WITH_EN.find((n) => n.slug === slug);
  return withTimeout<NewsPost | undefined>(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("bit_news")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return fallback;
    return mapNews(data as unknown as NewsRow);
  }, fallback);
}
