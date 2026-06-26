import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { posts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;

  const staticRoutes = [
    "",
    "/ueber-uns",
    "/bioland",
    "/blog",
    "/leistungen",
    "/pools",
    "/kontakt",
    "/impressum",
    "/datenschutz",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${base}/leistungen/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogRoutes = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
