import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS } from "./bit/_data/catalog";
import { NEWS } from "./bit/_data/news";
import { CONTENT_PAGES } from "./bit/_data/pages";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "/bit",
    "/bit/produkte",
    "/bit/news",
    "/bit/kompetenzen",
    "/bit/branchen",
    "/bit/unternehmen",
    "/bit/karriere",
    "/bit/nachhaltigkeit",
    "/bit/qualitaet",
    "/bit/kontakt",
    "/bit/impressum",
    "/bit/barrierefreiheit",
    "/bit/datenschutz",
  ];
  const contentPaths = CONTENT_PAGES.map((p) => `/bit/${p.slug}`);
  const categoryPaths = CATEGORIES.map((c) => `/bit/${c.id}`);
  const productPaths = PRODUCTS.map((p) => `/bit/produkte/${p.category}/${p.slug}`);
  const newsPaths = NEWS.map((n) => `/bit/news/${n.slug}`);
  // Die Filter-/Landing-Seiten (eigenschaft/anwendung/material/schrumpfrate und
  // ihre Kategorie-Varianten) sind bewusst noindex (Duplicate-Content/
  // Kannibalisierung) und daher nicht in der Sitemap.

  return [...staticPaths, ...categoryPaths, ...contentPaths, ...productPaths, ...newsPaths].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency:
      path === "/bit/produkte" || path === "/bit/news" ? "weekly" : "monthly",
    priority:
      path === "/bit"
        ? 1
        : path.startsWith("/bit/produkte/") || path.startsWith("/bit/news/")
          ? 0.6
          : path.includes("/eigenschaft/") || path.includes("/anwendung/")
            ? 0.7
            : 0.8,
  }));
}
