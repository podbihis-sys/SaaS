import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer is server-only; keep it out of the client/edge bundle.
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      // Supabase Storage signed URLs for item images.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
