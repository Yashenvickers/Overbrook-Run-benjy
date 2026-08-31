"use client";

/**
 * Sanity Studio configuration (embedded at /studio).
 * The Studio route only mounts when NEXT_PUBLIC_SANITY_PROJECT_ID is set.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { BRAND_NAME } from "./src/config/site";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  name: "preee-tv",
  title: `${BRAND_NAME} Studio`,
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
