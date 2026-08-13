import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
  async redirects() {
    // Diese Deployment-Domain liefert die BIT-Website aus: Startseite "/" zeigt
    // auf "/bit". Damit crawlt z. B. Semrush direkt die BIT-Inhalte (statt der
    // SaaS-App am Root) und liefert konsistente Ergebnisse.
    return [
      { source: "/", destination: "/bit", permanent: true },
      // "Kantenclips" ist keine eigene Kategorie mehr, sondern Teil von
      // "Weitere Produkte". Alte Links/Suchtreffer bleiben so gültig.
      { source: "/bit/kantenclips", destination: "/bit/weitere-produkte", permanent: true },
      { source: "/bit/produkte/kantenclips", destination: "/bit/weitere-produkte", permanent: true },
      {
        source: "/bit/produkte/kantenclips/:slug",
        destination: "/bit/produkte/weitere-produkte/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
