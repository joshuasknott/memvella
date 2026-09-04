import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  transpilePackages: ["@memvella/ui", "@memvella/backend"],
};

export default nextConfig;
