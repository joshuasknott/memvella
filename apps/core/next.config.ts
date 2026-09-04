import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1", "memvella.me"],
  transpilePackages: ["@memvella/ui", "@memvella/backend"],
};

export default nextConfig;
