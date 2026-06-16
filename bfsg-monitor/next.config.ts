import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer is a heavy, server-only dependency — keep it external
  // instead of bundling it for the report route handler.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
