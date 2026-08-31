import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, projectId, sanityConfigured } from "./env";

export const client = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
      stega: { studioUrl: "/studio" },
    })
  : null;

/**
 * Server-side fetch with optional draft-mode preview. Falls back to null when
 * Sanity is not configured — callers must handle the seed-content path.
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
  { preview = false, revalidate = 60 }: { preview?: boolean; revalidate?: number | false } = {},
): Promise<T | null> {
  if (!client) return null;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (preview && token) {
    return client.fetch<T>(query, params, {
      token,
      perspective: "previewDrafts",
      useCdn: false,
      stega: true,
      next: { revalidate: 0 },
    });
  }
  return client.fetch<T>(query, params, {
    next: { revalidate },
  });
}
