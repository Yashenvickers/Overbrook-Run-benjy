import { defineArrayMember, defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "bio", type: "text", rows: 3 }),
    defineField({ name: "photo", type: "editorialImage" }),
  ],
});

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
      description: "Must match a site section: music, culture, business, interviews, performances.",
    }),
    defineField({ name: "description", type: "text", rows: 2 }),
  ],
});

export const videoEpisode = defineType({
  name: "videoEpisode",
  title: "Video episode",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "guest", title: "Guest name", type: "string" }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "youtubeId",
      title: "YouTube video ID",
      type: "string",
      description: "The 11-character ID (or leave empty and use External URL).",
    }),
    defineField({
      name: "externalUrl",
      title: "External video URL",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "poster",
      title: "Poster / thumbnail",
      type: "editorialImage",
      validation: (r) => r.required(),
    }),
    defineField({ name: "runtime", type: "string", description: "e.g. 24:00" }),
    defineField({ name: "publishedAt", type: "datetime", validation: (r) => r.required() }),
    defineField({
      name: "topics",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({ name: "sponsorDisclosure", type: "string" }),
    defineField({ name: "transcript", type: "text", rows: 10 }),
    defineField({
      name: "relatedArticles",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "article" }] })],
    }),
    defineField({
      name: "comingSoon",
      title: "Coming soon (hide player, show premiere state)",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: { select: { title: "title", subtitle: "guest", media: "poster" } },
});

export const shortClip = defineType({
  name: "shortClip",
  title: "Short clip",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "youtubeId", title: "YouTube ID", type: "string" }),
    defineField({
      name: "externalUrl",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "poster", type: "editorialImage" }),
    defineField({
      name: "episode",
      title: "From episode",
      type: "reference",
      to: [{ type: "videoEpisode" }],
    }),
    defineField({ name: "publishedAt", type: "datetime" }),
  ],
});

export const event = defineType({
  name: "event",
  title: "Calendar event",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      options: {
        list: [
          "Music",
          "Culture",
          "Industry",
          "Release",
          "Festival",
          "Award Show",
          "Community",
          "Preee TV",
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "start", type: "datetime", validation: (r) => r.required() }),
    defineField({ name: "end", type: "datetime" }),
    defineField({
      name: "timezone",
      type: "string",
      initialValue: "America/New_York",
      description: "IANA timezone, e.g. America/New_York.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "city", title: "City / market", type: "string" }),
    defineField({ name: "venue", type: "string" }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({
      name: "sourceUrl",
      title: "Source URL",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "ticketUrl",
      title: "Ticket / info URL",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "ticketsAvailable",
      title: "Tickets confirmed available",
      type: "boolean",
      description: "Only switch on when the source explicitly confirms availability.",
    }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
  ],
});

export const artistProfile = defineType({
  name: "artistProfile",
  title: "Artist profile",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "origin", type: "string" }),
    defineField({ name: "genre", type: "string" }),
    defineField({
      name: "oneLiner",
      title: "One-liner",
      type: "text",
      rows: 2,
      validation: (r) => r.required().max(300),
    }),
    defineField({ name: "bio", type: "text", rows: 4 }),
    defineField({ name: "image", type: "editorialImage", validation: (r) => r.required() }),
    defineField({
      name: "links",
      type: "array",
      of: [{ type: "sourceLink" }],
    }),
    defineField({
      name: "spotlight",
      title: "Current homepage spotlight",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

export const sponsor = defineType({
  name: "sponsor",
  title: "Sponsor",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "logo", type: "editorialImage" }),
    defineField({
      name: "url",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "active", type: "boolean", initialValue: false }),
    defineField({
      name: "placements",
      type: "array",
      of: [{ type: "string" }],
      options: { list: ["series", "segments", "events", "newsletter"] },
    }),
  ],
});

export const breakingItem = defineType({
  name: "breakingItem",
  title: "Breaking / now bar",
  type: "document",
  fields: [
    defineField({ name: "text", type: "string", validation: (r) => r.required().max(160) }),
    defineField({
      name: "href",
      title: "Link (site path)",
      type: "string",
      description: "Site-relative path like /watch, or leave empty.",
    }),
    defineField({ name: "active", type: "boolean", initialValue: false }),
  ],
});

export const correction = defineType({
  name: "correction",
  title: "Correction log",
  type: "document",
  fields: [
    defineField({
      name: "article",
      type: "reference",
      to: [{ type: "article" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "note", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "date", type: "date", validation: (r) => r.required() }),
  ],
});
