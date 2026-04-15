import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "memvella.me"],
  transpilePackages: ["@memvella/ui"],
};

export default nextConfig;
