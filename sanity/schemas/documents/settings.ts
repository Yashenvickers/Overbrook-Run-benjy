import { defineArrayMember, defineField, defineType } from "sanity";

export const homepageSettings = defineType({
  name: "homepageSettings",
  title: "Homepage settings",
  type: "document",
  description:
    "Editorial curation controls. NOTE: v1 of the frontend derives the homepage automatically (newest featured story, spotlight flag); wiring these overrides in is a documented follow-up — see docs/DECISIONS.md.",
  fields: [
    defineField({
      name: "heroArticle",
      title: "Hero lead story",
      type: "reference",
      to: [{ type: "article" }],
      description:
        "Overrides the automatic pick (newest featured story) once wired — see docs/DECISIONS.md.",
    }),
    defineField({
      name: "secondaryArticles",
      title: "Secondary lead stories",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "article" }] })],
      validation: (r) => r.max(2),
    }),
    defineField({
      name: "featuredEpisodes",
      title: "Watch rail order",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "videoEpisode" }] })],
    }),
    defineField({
      name: "spotlightArtist",
      type: "reference",
      to: [{ type: "artistProfile" }],
    }),
    defineField({
      name: "adInventoryEnabled",
      title: "Enable ad / partner inventory",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "siteTitle", type: "string" }),
    defineField({ name: "tagline", type: "string" }),
    defineField({
      name: "socialLinks",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "platform",
              type: "string",
              options: {
                list: ["youtube", "instagram", "tiktok", "facebook", "x", "threads"],
              },
            }),
            defineField({
              name: "url",
              type: "url",
              validation: (r) => r.uri({ scheme: ["https"] }),
            }),
          ],
        }),
      ],
    }),
    defineField({ name: "defaultSocialImage", type: "editorialImage" }),
  ],
});
