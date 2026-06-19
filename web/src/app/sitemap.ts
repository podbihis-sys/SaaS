import type { MetadataRoute } from "next";
import { PRODUCTS } from "./bit/_data/catalog";
import {
  applicationTaxa,
  categoriesForProducts,
  materialTaxa,
  propertyTaxa,
  shrinkTaxa,
} from "./bit/_data/attributes";
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
    ...propertyTaxa().flatMap((t) => [
      `/bit/produkte/eigenschaft/${t.slug}`,
      ...categoriesForProducts(t.products).map(
        (c) => `/bit/produkte/eigenschaft/${t.slug}/${c.id}`,
      ),
    ]),
    ...applicationTaxa().flatMap((t) => [
      `/bit/produkte/anwendung/${t.slug}`,
      ...categoriesForProducts(t.products).map(
        (c) => `/bit/produkte/anwendung/${t.slug}/${c.id}`,
      ),
    ]),
    ...materialTaxa().flatMap((t) => [
      `/bit/produkte/material/${t.slug}`,
      ...categoriesForProducts(t.products).map(
        (c) => `/bit/produkte/material/${t.slug}/${c.id}`,
      ),
    ]),
    ...shrinkTaxa().flatMap((t) => [
      `/bit/produkte/schrumpfrate/${t.slug}`,
      ...categoriesForProducts(t.products).map(
        (c) => `/bit/produkte/schrumpfrate/${t.slug}/${c.id}`,
      ),
    ]),
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
