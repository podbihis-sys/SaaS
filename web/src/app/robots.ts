import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.bit-gmbh.de";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/bit/admin",
          "/bit/warenkorb",
          "/dashboard",
          "/inquiries",
          "/quotes",
          "/customers",
          "/prices",
          "/settings",
          "/team",
          "/onboarding",
          "/login",
          "/register",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
