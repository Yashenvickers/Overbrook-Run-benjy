/**
 * Shared content types. These model both Sanity documents and the local seed
 * content so every page renders identically from either source.
 */

export type RightsStatus =
  | "owned"
  | "guest-provided"
  | "press-approved"
  | "licensed"
  | "embedded"
  | "generated"
  | "unknown";

export interface MediaImage {
  /** Local public path (seed) or Sanity CDN URL. */
  src: string;
  alt: string;
  credit?: string;
  sourceNote?: string;
  rightsStatus: RightsStatus;
  /** ISO date after which licensed rights expire. */
  rightsExpiry?: string;
  width?: number;
  height?: number;
}

export type CategorySlug =
  | "music"
  | "culture"
  | "business"
  | "interviews"
  | "performances";

export interface Category {
  slug: CategorySlug;
  title: string;
  description: string;
}

export interface Author {
  slug: string;
  name: string;
  role?: string;
  bio?: string;
}

/** Portable-text-lite blocks used by seed content. Sanity articles use real Portable Text. */
export type SeedBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "pullQuote"; text: string; attribution?: string }
  | { type: "image"; image: MediaImage };

export interface SourceLink {
  label: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  dek: string;
  category: CategorySlug;
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  hero: MediaImage;
  body: SeedBlock[];
  /** Sanity Portable Text body when sourced from the CMS. */
  portableBody?: unknown[];
  sourceLinks?: SourceLink[];
  sponsorDisclosure?: string;
  correction?: { note: string; date: string };
  tags?: string[];
  featured?: boolean;
  /** Distinguishes evergreen/launch editorial from dated reporting. */
  evergreen?: boolean;
}

export interface VideoEpisode {
  slug: string;
  title: string;
  guest?: string;
  description: string;
  youtubeId?: string;
  externalUrl?: string;
  poster: MediaImage;
  runtime?: string;
  publishedAt: string;
  topics: string[];
  sponsorDisclosure?: string;
  transcript?: string;
  relatedArticleSlugs?: string[];
  comingSoon?: boolean;
}

export type EventCategory =
  | "Music"
  | "Culture"
  | "Industry"
  | "Release"
  | "Festival"
  | "Award Show"
  | "Community"
  | "Preee TV";

export interface CultureEvent {
  id: string;
  title: string;
  category: EventCategory;
  /** ISO start with offset, e.g. 2026-09-12T20:00:00-04:00 */
  start: string;
  end?: string;
  timezone: string;
  city?: string;
  venue?: string;
  description?: string;
  sourceUrl?: string;
  ticketUrl?: string;
  /** Only set when source data explicitly provides availability. */
  ticketsAvailable?: boolean;
  featured?: boolean;
}

export interface ArtistProfile {
  slug: string;
  name: string;
  origin?: string;
  genre?: string;
  oneLiner: string;
  bio?: string;
  image: MediaImage;
  links?: SourceLink[];
  spotlight?: boolean;
}

export interface BreakingItem {
  id: string;
  text: string;
  href?: string;
  active: boolean;
}

export interface SiteContent {
  articles: Article[];
  episodes: VideoEpisode[];
  events: CultureEvent[];
  artists: ArtistProfile[];
  breaking: BreakingItem[];
  categories: Category[];
}
