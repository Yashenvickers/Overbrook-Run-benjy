import type { MetadataRoute } from "next";
import { getArticles, getEpisodes } from "@/lib/content";
import { SITE_URL } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, episodes] = await Promise.all([getArticles(), getEpisodes()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/latest",
    "/music",
    "/culture",
    "/business",
    "/interviews",
    "/performances",
    "/watch",
    "/calendar",
    "/about",
    "/submit-music",
    "/request-interview",
    "/book-promotion",
    "/sponsor",
    "/newsletter",
    "/contact",
    "/privacy",
    "/terms",
    "/submission-terms",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" || path === "/latest" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/stories/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const episodeRoutes: MetadataRoute.Sitemap = episodes.map((e) => ({
    url: `${SITE_URL}/watch/${e.slug}`,
    lastModified: new Date(e.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes, ...episodeRoutes];
}
