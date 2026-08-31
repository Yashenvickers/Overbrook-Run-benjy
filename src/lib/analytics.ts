"use client";

/**
 * Typed analytics helper. Fires to GA4 (when configured) and Vercel
 * Analytics (when present) — and is a safe no-op otherwise.
 */

export type AnalyticsEvent =
  | { name: "story_view"; props: { slug: string; category: string } }
  | { name: "video_start"; props: { slug: string } }
  | { name: "video_complete"; props: { slug: string } }
  | { name: "newsletter_signup"; props: { location: string } }
  | { name: "submit_music_start"; props: Record<string, never> }
  | { name: "submit_music_complete"; props: Record<string, never> }
  | { name: "interview_request_complete"; props: Record<string, never> }
  | { name: "promotion_inquiry_complete"; props: Record<string, never> }
  | { name: "sponsor_inquiry_complete"; props: Record<string, never> }
  | { name: "calendar_event_open"; props: { eventId: string } }
  | { name: "calendar_add"; props: { eventId: string } }
  | { name: "share_click"; props: { slug: string; channel: string } }
  | { name: "outbound_click"; props: { url: string } }
  | { name: "search"; props: { query: string; results: number } };

export function track<E extends AnalyticsEvent>(name: E["name"], props: E["props"]): void {
  if (typeof window === "undefined") return;
  try {
    // Loose-typed access: these globals exist only when GA4 / Vercel
    // Analytics are actually loaded, and other packages declare their own
    // (conflicting) global types for them.
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      va?: (event: "event", properties: { name: string; data?: Record<string, unknown> }) => void;
    };
    w.gtag?.("event", name, props);
    // Vercel Analytics custom events queue (safe if the script isn't loaded).
    w.va?.("event", { name, data: props as Record<string, unknown> });
  } catch {
    // analytics must never break the page
  }
}
