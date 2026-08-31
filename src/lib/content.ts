import "server-only";
import { cache } from "react";
import seed from "../../data/seed-content.json";
import type {
  Article,
  ArtistProfile,
  BreakingItem,
  Category,
  CategorySlug,
  CultureEvent,
  SiteContent,
  VideoEpisode,
} from "@/lib/types";
import { sanityConfigured } from "@/lib/sanity/env";
import { sanityFetch } from "@/lib/sanity/client";
import {
  articlesQuery,
  artistsQuery,
  breakingQuery,
  episodesQuery,
  eventsQuery,
} from "@/lib/sanity/queries";

const seedContent = seed as unknown as Omit<SiteContent, "breaking"> & {
  breaking: BreakingItem[];
};

async function isPreview(): Promise<boolean> {
  try {
    const { draftMode } = await import("next/headers");
    const dm = await draftMode();
    return dm.isEnabled;
  } catch {
    return false;
  }
}

/**
 * Content source of truth. When Sanity is configured, content comes from the
 * CMS (with seed as a safety fallback for empty datasets); otherwise the
 * bundled seed content powers the whole site so first run needs no services.
 */
export const getArticles = cache(async (): Promise<Article[]> => {
  if (sanityConfigured) {
    const preview = await isPreview();
    const data = await sanityFetch<Article[]>(articlesQuery, {}, { preview });
    if (data && data.length > 0) return data;
  }
  return [...seedContent.articles].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
});

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  const articles = await getArticles();
  return articles.find((a) => a.slug === slug) ?? null;
});

export const getArticlesByCategory = cache(
  async (category: CategorySlug): Promise<Article[]> => {
    const articles = await getArticles();
    return articles.filter((a) => a.category === category);
  },
);

export const getEpisodes = cache(async (): Promise<VideoEpisode[]> => {
  if (sanityConfigured) {
    const preview = await isPreview();
    const data = await sanityFetch<VideoEpisode[]>(episodesQuery, {}, { preview });
    if (data && data.length > 0) return data;
  }
  return [...seedContent.episodes].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
});

export const getEpisodeBySlug = cache(async (slug: string): Promise<VideoEpisode | null> => {
  const episodes = await getEpisodes();
  return episodes.find((e) => e.slug === slug) ?? null;
});

export const getEvents = cache(async (): Promise<CultureEvent[]> => {
  if (sanityConfigured) {
    const data = await sanityFetch<CultureEvent[]>(eventsQuery);
    if (data && data.length > 0) return data;
  }
  return [...seedContent.events].sort((a, b) => +new Date(a.start) - +new Date(b.start));
});

export const getUpcomingEvents = cache(async (limit?: number): Promise<CultureEvent[]> => {
  const events = await getEvents();
  const now = Date.now();
  const upcoming = events.filter((e) => {
    const end = e.end ? +new Date(e.end) : +new Date(e.start);
    return end >= now;
  });
  return typeof limit === "number" ? upcoming.slice(0, limit) : upcoming;
});

export const getArtists = cache(async (): Promise<ArtistProfile[]> => {
  if (sanityConfigured) {
    const data = await sanityFetch<ArtistProfile[]>(artistsQuery);
    if (data && data.length > 0) return data;
  }
  return seedContent.artists;
});

export const getBreaking = cache(async (): Promise<BreakingItem | null> => {
  if (sanityConfigured) {
    const data = await sanityFetch<BreakingItem[]>(breakingQuery);
    if (data && data.length > 0) return data[0];
  }
  return seedContent.breaking.find((b) => b.active) ?? null;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  return seedContent.categories;
});

export const getCategory = cache(async (slug: CategorySlug): Promise<Category | null> => {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
});

export interface SearchResult {
  type: "article" | "episode" | "event" | "artist";
  title: string;
  description: string;
  href: string;
  date?: string;
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const [articles, episodes, events, artists] = await Promise.all([
    getArticles(),
    getEpisodes(),
    getEvents(),
    getArtists(),
  ]);

  const matches = (...fields: (string | undefined)[]) =>
    fields.some((f) => f?.toLowerCase().includes(q));

  const results: SearchResult[] = [];
  for (const a of articles) {
    if (matches(a.title, a.dek, a.category, ...(a.tags ?? []))) {
      results.push({
        type: "article",
        title: a.title,
        description: a.dek,
        href: `/stories/${a.slug}`,
        date: a.publishedAt,
      });
    }
  }
  for (const e of episodes) {
    if (matches(e.title, e.description, e.guest, ...(e.topics ?? []))) {
      results.push({
        type: "episode",
        title: e.title,
        description: e.description,
        href: `/watch/${e.slug}`,
        date: e.publishedAt,
      });
    }
  }
  for (const ev of events) {
    if (matches(ev.title, ev.description, ev.city, ev.category)) {
      results.push({
        type: "event",
        title: ev.title,
        description: ev.description ?? ev.category,
        href: `/calendar?event=${encodeURIComponent(ev.id)}`,
        date: ev.start,
      });
    }
  }
  for (const artist of artists) {
    if (matches(artist.name, artist.oneLiner, artist.genre, artist.origin)) {
      results.push({
        type: "artist",
        title: artist.name,
        description: artist.oneLiner,
        href: `/about#spotlight`,
      });
    }
  }
  return results.slice(0, 40);
}
