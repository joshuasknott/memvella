import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/contact", "/privacy", "/terms"].map((path) => ({
    url: `https://memvella.me${path === "/" ? "" : path}`,
  }));
}
