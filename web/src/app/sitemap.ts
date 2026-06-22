import type { MetadataRoute } from "next";
import { PRODUCTS } from "./bit/_data/catalog";
import { NEWS } from "./bit/_data/news";
import {
  categoryTaxa,
  materialTaxa,
  propertyTaxa,
  shrinkTaxa,
} from "./bit/_data/attributes";

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
  // Indexierbare SEO-Landingpages (Kategorie, Material, Eigenschaft,
  // Schrumpfrate) – keyword-reich und mit eigenem, einzigartigem Inhalt.
  const categoryPaths = categoryTaxa().map((t) => `/bit/produkte/kategorie/${t.slug}`);
  const materialPaths = materialTaxa().map((t) => `/bit/produkte/material/${t.slug}`);
  const propertyPaths = propertyTaxa().map((t) => `/bit/produkte/eigenschaft/${t.slug}`);
  const shrinkPaths = shrinkTaxa().map((t) => `/bit/produkte/schrumpfrate/${t.slug}`);
  // Die Kategorie-Verfeinerungen (.../[slug]/[kategorie]) und die
  // Anwendungs-Seiten bleiben bewusst noindex und sind nicht in der Sitemap.

  return [
    ...staticPaths,
    ...categoryPaths,
    ...materialPaths,
    ...propertyPaths,
    ...shrinkPaths,
    ...productPaths,
    ...newsPaths,
  ].map((path) => ({
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
