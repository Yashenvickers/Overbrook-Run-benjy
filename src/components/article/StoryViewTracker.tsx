"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function StoryViewTracker({ slug, category }: { slug: string; category: string }) {
  useEffect(() => {
    track("story_view", { slug, category });
  }, [slug, category]);
  return null;
}
