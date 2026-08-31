import { defineField, defineType } from "sanity";

export const sourceLink = defineType({
  name: "sourceLink",
  title: "Source link",
  type: "object",
  fields: [
    defineField({ name: "label", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "url",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
  ],
});

export const pullQuote = defineType({
  name: "pullQuote",
  title: "Pull quote",
  type: "object",
  fields: [
    defineField({ name: "text", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "attribution", type: "string" }),
  ],
  preview: {
    select: { title: "text" },
    prepare: ({ title }) => ({ title: `“${title}”` }),
  },
});

export const seoFields = [
  defineField({
    name: "canonicalUrl",
    title: "Canonical URL",
    type: "url",
    description: "Only set when this content canonically lives elsewhere.",
    validation: (r) => r.uri({ scheme: ["http", "https"] }),
  }),
  defineField({
    name: "socialTitle",
    title: "Social share title",
    type: "string",
    description: "Overrides the headline in OG/Twitter cards.",
  }),
  defineField({
    name: "socialDescription",
    title: "Social share description",
    type: "text",
    rows: 2,
  }),
  defineField({
    name: "socialImage",
    title: "Social share image",
    type: "editorialImage",
  }),
];
