import type { MetadataRoute } from "next";
import { BRANCHES } from "@/lib/seo/branches";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/verleih-software", "/impressum", "/datenschutz", "/agb"].map(
    (path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

  const brancheRoutes = BRANCHES.map((b) => ({
    url: `${BASE}/verleih/${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...brancheRoutes];
}
