import { defineField, defineType } from "sanity";

/**
 * Every image in the CMS carries alt text, credit, and rights metadata.
 * Publishing without alt text or a rights status is blocked by validation.
 */
export const editorialImage = defineType({
  name: "editorialImage",
  title: "Editorial image",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Describe the image for screen readers. Required.",
      validation: (rule) => rule.required().min(4).max(300),
    }),
    defineField({
      name: "credit",
      title: "Credit",
      type: "string",
      description: "Photographer / creator credit shown with the image.",
    }),
    defineField({
      name: "sourceNote",
      title: "Source / license note",
      type: "string",
      description: "Where this image came from and under what terms.",
    }),
    defineField({
      name: "rightsStatus",
      title: "Rights status",
      type: "string",
      options: {
        list: [
          { title: "Owned", value: "owned" },
          { title: "Guest-provided", value: "guest-provided" },
          { title: "Press-approved", value: "press-approved" },
          { title: "Licensed", value: "licensed" },
          { title: "Embedded", value: "embedded" },
          { title: "Generated", value: "generated" },
          { title: "Unknown", value: "unknown" },
        ],
        layout: "radio",
      },
      initialValue: "unknown",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rightsExpiry",
      title: "Rights expiry",
      type: "date",
      description: "If licensed rights expire, when. Leave empty for perpetual/owned.",
      hidden: ({ parent }) => parent?.rightsStatus !== "licensed",
    }),
  ],
});
