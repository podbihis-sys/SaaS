import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
    return [{ source: "/", destination: "/bit", permanent: true }];
  },
};

export default nextConfig;
