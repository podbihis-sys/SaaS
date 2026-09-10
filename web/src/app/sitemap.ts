import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS } from "./bit/_data/catalog";
import { NEWS } from "./bit/_data/news";
import { CONTENT_PAGES } from "./bit/_data/pages";
import { CONTENT_PAGES_EN } from "./bit/_data/pages-en";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "/bit",
    "/bit/produkte",
    "/bit/news",
    "/bit/kompetenzen",
    "/bit/branchen",
    "/bit/die-bit",
    "/bit/karriere",
    "/bit/nachhaltigkeit",
    "/bit/qualitaet",
    "/bit/kontakt",
    "/bit/faq",
    "/bit/en",
    "/bit/impressum",
    "/bit/barrierefreiheit",
    "/bit/datenschutz",
  ];
  const contentPaths = CONTENT_PAGES.map((p) => `/bit/${p.slug}`);
  const categoryPaths = CATEGORIES.map((c) => `/bit/${c.id}`);
  const productPaths = PRODUCTS.map((p) => `/bit/produkte/${p.category}/${p.slug}`);
  const newsPaths = NEWS.map((n) => `/bit/news/${n.slug}`);
  // Englische Seiten (/bit/en) – Inhaltsseiten, Kategorien und Produkte.
  const enPaths = [
    "/bit/en/products",
    ...CONTENT_PAGES_EN.map((p) => `/bit/en/${p.slug}`),
    ...CATEGORIES.map((c) => `/bit/en/products/${c.id}`),
    ...PRODUCTS.map((p) => `/bit/en/products/${p.category}/${p.slug}`),
  ];
  // Die Filter-/Landing-Seiten (eigenschaft/anwendung/material/schrumpfrate und
  // ihre Kategorie-Varianten) sind bewusst noindex (Duplicate-Content/
  // Kannibalisierung) und daher nicht in der Sitemap.

  return [...staticPaths, ...categoryPaths, ...contentPaths, ...productPaths, ...newsPaths, ...enPaths].map((path) => ({
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
