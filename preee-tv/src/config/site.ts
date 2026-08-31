/**
 * Single source of truth for brand strings, navigation, social handles and
 * site-level configuration. Change brand copy here — nothing else hardcodes it.
 */

export const BRAND_NAME = "Preee TV";
export const BRAND_SHORT = "Preee";
export const BRAND_TAGLINE =
  "Culture, music, and the conversations shaping what comes next.";
export const BRAND_EDITORIAL_LINE =
  "Music, culture, and the conversation behind the headline.";
export const BRAND_HOOK = "YOU DON’T KNOW ABOUT IT TILL WE TELL YOU ABOUT IT.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Social profiles. Leave a value empty ("") until the real handle exists —
 * empty entries are hidden everywhere instead of linking to "#".
 */
export const SOCIAL_LINKS: { platform: SocialPlatform; url: string }[] = [
  { platform: "youtube", url: "" },
  { platform: "instagram", url: "" },
  { platform: "tiktok", url: "" },
  { platform: "facebook", url: "" },
  { platform: "x", url: "" },
  { platform: "threads", url: "" },
];

export type SocialPlatform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "x"
  | "threads";

export const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Latest", href: "/latest" },
  { label: "Music", href: "/music" },
  { label: "Culture", href: "/culture" },
  { label: "The Business", href: "/business" },
  { label: "Interviews", href: "/interviews" },
  { label: "Performances", href: "/performances" },
  { label: "Watch", href: "/watch" },
  { label: "Calendar", href: "/calendar" },
];

export const FOOTER_GROUPS: {
  heading: string;
  links: { label: string; href: string }[];
}[] = [
  {
    heading: "Coverage",
    links: [
      { label: "Latest", href: "/latest" },
      { label: "Music", href: "/music" },
      { label: "Culture", href: "/culture" },
      { label: "The Business", href: "/business" },
      { label: "Interviews", href: "/interviews" },
      { label: "Performances", href: "/performances" },
    ],
  },
  {
    heading: "Watch & Listen",
    links: [
      { label: "Watch Preee TV", href: "/watch" },
      { label: "Culture Calendar", href: "/calendar" },
      { label: "Search", href: "/search" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
  {
    heading: "Work With Us",
    links: [
      { label: "Submit Music", href: "/submit-music" },
      { label: "Request an Interview", href: "/request-interview" },
      { label: "Book Promotion", href: "/book-promotion" },
      { label: "Sponsor Preee TV", href: "/sponsor" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Submission Terms", href: "/submission-terms" },
    ],
  },
];

/** Ad / partner inventory — renders nothing anywhere until enabled. */
export const AD_INVENTORY_ENABLED = false;

export const CONTACT_EMAIL = "hello@preee.tv"; // placeholder until confirmed

export const isSanityConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

export const isSupabaseConfigured = () =>
  Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const isResendConfigured = () => Boolean(process.env.RESEND_API_KEY);

export const isTurnstileConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
