import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@memvella/ui", "@memvella/backend"],
};

export default nextConfig;
