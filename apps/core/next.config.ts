import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/supporter",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/supporter/:path*",
        permanent: false,
      },
      {
        source: "/onboarding/admin",
        destination: "/onboarding/supporter",
        permanent: false,
      },
      {
        source: "/onboarding/admin/:path*",
        destination: "/onboarding/supporter/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
