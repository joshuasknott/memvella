import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "memvella.me"],
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/circle",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/circle/:path*",
        permanent: false,
      },
      {
        source: "/onboarding/admin",
        destination: "/onboarding/organiser",
        permanent: false,
      },
      {
        source: "/onboarding/admin/:path*",
        destination: "/onboarding/organiser/:path*",
        permanent: false,
      },
      {
        source: "/supporter/signin",
        destination: "/organiser/signin",
        permanent: false,
      },
      {
        source: "/supporter",
        destination: "/circle",
        permanent: false,
      },
      {
        source: "/supporter/:path*",
        destination: "/circle/:path*",
        permanent: false,
      },
      {
        source: "/onboarding/supporter",
        destination: "/onboarding/organiser",
        permanent: false,
      },
      {
        source: "/onboarding/supporter/:path*",
        destination: "/onboarding/organiser/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
