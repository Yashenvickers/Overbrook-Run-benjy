import { defineArrayMember, defineField, defineType } from "sanity";
import { seoFields } from "../objects/shared";

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Meta & SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Headline",
      type: "string",
      group: "content",
      validation: (r) => r.required().max(140),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "dek",
      title: "Dek (standfirst)",
      type: "text",
      rows: 2,
      group: "content",
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({ name: "updatedAt", type: "datetime", group: "content" }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "editorialImage",
      group: "content",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading", value: "h2" },
            { title: "Quote", value: "blockquote" },
          ],
        }),
        defineArrayMember({ type: "pullQuote" }),
        defineArrayMember({ type: "editorialImage", name: "articleImage", title: "Inline image" }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sourceLinks",
      title: "Sources",
      type: "array",
      of: [defineArrayMember({ type: "sourceLink" })],
      group: "content",
    }),
    defineField({
      name: "sponsorDisclosure",
      title: "Sponsor disclosure",
      type: "string",
      description: "If this story is sponsored, say so here — it renders prominently at the top.",
      group: "content",
    }),
    defineField({
      name: "correction",
      title: "Correction / update note",
      type: "object",
      group: "content",
      fields: [
        defineField({ name: "note", type: "text", rows: 2 }),
        defineField({ name: "date", type: "date" }),
      ],
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      group: "meta",
    }),
    defineField({
      name: "featured",
      title: "Featured (homepage eligible)",
      type: "boolean",
      initialValue: false,
      group: "meta",
    }),
    defineField({
      name: "evergreen",
      title: "Evergreen / editorial (not dated reporting)",
      type: "boolean",
      initialValue: false,
      group: "meta",
    }),
    ...seoFields.map((f) => ({ ...f, group: "meta" })),
  ],
  preview: {
    select: { title: "title", subtitle: "dek", media: "heroImage" },
  },
});
