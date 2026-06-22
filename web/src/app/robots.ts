import type { MetadataRoute } from "next";

import { SITE_URL } from "./bit/_lib/site";

const BASE = SITE_URL;

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
