import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://theportalhq.com";
  const routes = [
    "",
    "/corporate",
    "/concerts",
    "/celebrations",
    "/portal-hq",
    "/sip-and-sync",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
