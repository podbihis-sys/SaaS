import type { MetadataRoute } from "next";
import { PRODUCTS } from "./bit/_data/catalog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "/bit",
    "/bit/produkte",
    "/bit/unternehmen",
    "/bit/qualitaet",
    "/bit/kontakt",
  ];
  const productPaths = PRODUCTS.map((p) => `/bit/produkte/${p.slug}`);

  return [...staticPaths, ...productPaths].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "/bit/produkte" ? "weekly" : "monthly",
    priority: path === "/bit" ? 1 : path.startsWith("/bit/produkte/") ? 0.6 : 0.8,
  }));
}
