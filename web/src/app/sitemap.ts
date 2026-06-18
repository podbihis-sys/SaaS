import type { MetadataRoute } from "next";
import { PRODUCTS } from "./bit/_data/catalog";
import { applicationTaxa, propertyTaxa } from "./bit/_data/attributes";
import { NEWS } from "./bit/_data/news";

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
    "/bit/qualitaet",
    "/bit/kontakt",
  ];
  const productPaths = PRODUCTS.map((p) => `/bit/produkte/${p.slug}`);
  const newsPaths = NEWS.map((n) => `/bit/news/${n.slug}`);
  const landingPaths = [
    ...propertyTaxa().map((t) => `/bit/produkte/eigenschaft/${t.slug}`),
    ...applicationTaxa().map((t) => `/bit/produkte/anwendung/${t.slug}`),
  ];

  return [...staticPaths, ...productPaths, ...newsPaths, ...landingPaths].map((path) => ({
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
