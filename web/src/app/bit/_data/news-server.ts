import { query, queryOne } from "@/app/bit/_lib/db";
import { withTimeout } from "@/app/bit/_lib/with-timeout";
import { bitImageUrl } from "./cms";
import { NEWS, type NewsPost } from "./news";
import { NEWS_EN } from "./news-en";

/**
 * Datenzugriff für News-Beiträge (MariaDB).
 *
 * Liest veröffentlichte Beiträge aus der Tabelle `bit_news` und fällt – solange
 * die Tabelle leer/nicht vorhanden ist – sauber auf die statische Liste aus
 * `news.ts` zurück. Die Seite funktioniert damit in jeder Phase.
 *
 * Oeffentliche Reads: nur status='published' (ersetzt die fruehere RLS).
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

const NEWS_COLS =
  "id,slug,title,published_at,excerpt,body,image_path,image_alt,status,title_en,excerpt_en,body_en";

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
    const where = opts.includeDrafts ? "" : " WHERE status = 'published'";
    const rows = await query<NewsRow>(
      `SELECT ${NEWS_COLS} FROM bit_news${where} ORDER BY published_at DESC`,
    );
    if (rows.length === 0) return NEWS_WITH_EN;
    return rows.map(mapNews);
  }, NEWS_WITH_EN);
}

export async function getCmsNewsPost(slug: string): Promise<NewsPost | undefined> {
  const fallback = NEWS_WITH_EN.find((n) => n.slug === slug);
  return withTimeout<NewsPost | undefined>(async () => {
    const row = await queryOne<NewsRow>(
      `SELECT ${NEWS_COLS} FROM bit_news WHERE slug = ? AND status = 'published' LIMIT 1`,
      [slug],
    );
    if (!row) return fallback;
    return mapNews(row);
  }, fallback);
}
