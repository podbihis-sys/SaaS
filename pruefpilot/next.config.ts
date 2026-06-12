import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Prüfprotokoll-PDFs laufen als FormData durch die Server Action.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
