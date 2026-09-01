import { z } from "zod";

/**
 * Lead pipeline schemas — shared by the client forms (react-hook-form +
 * zodResolver) and the server route handler (authoritative validation).
 */

export const LEAD_TYPES = [
  "submit_music",
  "request_interview",
  "book_promotion",
  "sponsor",
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

const email = z.string().trim().min(1, "Email is required.").email("Enter a valid email address.");
const requiredText = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);
const optionalText = (max = 500) => z.string().trim().max(max).optional().or(z.literal(""));
const urlField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .url(`${label} must be a full link starting with https://`)
    .refine((u) => u.startsWith("https://") || u.startsWith("http://"), {
      message: `${label} must start with http(s)://`,
    });
const consent = z.literal(true, {
  errorMap: () => ({ message: "You must agree before submitting." }),
});

/** Metadata captured on every lead. */
export const leadMetaSchema = z.object({
  // Honeypot — must stay empty. Bots fill it; humans never see it.
  website: z.string().max(0, "Submission rejected.").optional().or(z.literal("")),
  utmSource: optionalText(100),
  utmMedium: optionalText(100),
  utmCampaign: optionalText(100),
  utmTerm: optionalText(100),
  utmContent: optionalText(100),
  referrer: optionalText(500),
  consentAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
  turnstileToken: z.string().optional(),
});

export const submitMusicSchema = z
  .object({
    type: z.literal("submit_music"),
    artistName: requiredText("Artist / band name"),
    contactName: requiredText("Your name"),
    email,
    phone: optionalText(40),
    city: optionalText(120),
    genre: requiredText("Genre"),
    songLink: urlField("Song link"),
    additionalLinks: optionalText(1000),
    socialLinks: optionalText(1000),
    releaseStatus: z.enum(["released", "unreleased", "upcoming"], {
      errorMap: () => ({ message: "Choose a release status." }),
    }),
    story: requiredText("The story", 2000),
    agreeTerms: consent,
  })
  .merge(leadMetaSchema);

export const requestInterviewSchema = z
  .object({
    type: z.literal("request_interview"),
    contactName: requiredText("Your name"),
    email,
    company: optionalText(200),
    role: z.enum(["artist", "manager", "publicist", "label", "other"], {
      errorMap: () => ({ message: "Choose your role." }),
    }),
    artistName: requiredText("Artist / guest name"),
    links: requiredText("Links", 1000),
    pitch: requiredText("The pitch", 2000),
    availability: optionalText(300),
    city: optionalText(120),
    agreeTerms: consent,
  })
  .merge(leadMetaSchema);

export const bookPromotionSchema = z
  .object({
    type: z.literal("book_promotion"),
    contactName: requiredText("Your name"),
    email,
    company: optionalText(200),
    artistOrBrand: requiredText("Artist / brand"),
    campaignType: z.enum(["single", "ep_album", "video", "event", "tour", "other"], {
      errorMap: () => ({ message: "Choose a campaign type." }),
    }),
    budgetRange: z.enum(["under_1k", "1k_5k", "5k_15k", "15k_plus", "not_sure"], {
      errorMap: () => ({ message: "Choose a budget range." }),
    }),
    timeline: optionalText(300),
    goals: requiredText("Campaign goals", 2000),
    links: optionalText(1000),
    agreeTerms: consent,
  })
  .merge(leadMetaSchema);

export const sponsorSchema = z
  .object({
    type: z.literal("sponsor"),
    contactName: requiredText("Your name"),
    email,
    company: requiredText("Company / brand"),
    roleTitle: optionalText(200),
    budgetRange: z.enum(["under_5k", "5k_25k", "25k_100k", "100k_plus", "not_sure"], {
      errorMap: () => ({ message: "Choose a budget range." }),
    }),
    interests: z.preprocess(
      // Native checkbox groups yield `false` when nothing is checked.
      (v) => (Array.isArray(v) ? v : []),
      z
        .array(z.enum(["series", "segments", "events", "newsletter", "other"]))
        .min(1, "Pick at least one placement you're interested in."),
    ),
    message: requiredText("Your message", 2000),
    agreeTerms: consent,
  })
  .merge(leadMetaSchema);

export const leadSchema = z.discriminatedUnion("type", [
  submitMusicSchema,
  requestInterviewSchema,
  bookPromotionSchema,
  sponsorSchema,
]);

export type LeadPayload = z.infer<typeof leadSchema>;

export const newsletterSchema = z.object({
  email,
  location: z.string().trim().max(120).optional().or(z.literal("")),
  consentAt: z.string(),
  website: z.string().max(0).optional().or(z.literal("")),
});

/** Capture UTM + referrer client-side (called in the browser). */
export function captureAttribution(): {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  referrer: string;
} {
  if (typeof window === "undefined") {
    return { utmSource: "", utmMedium: "", utmCampaign: "", utmTerm: "", utmContent: "", referrer: "" };
  }
  const params = new URLSearchParams(window.location.search);
  let stored: Record<string, string> = {};
  try {
    stored = JSON.parse(window.sessionStorage.getItem("preee_attribution") ?? "{}");
  } catch {
    stored = {};
  }
  const get = (key: string, storedKey: string) => params.get(key) ?? stored[storedKey] ?? "";
  const result = {
    utmSource: get("utm_source", "utmSource"),
    utmMedium: get("utm_medium", "utmMedium"),
    utmCampaign: get("utm_campaign", "utmCampaign"),
    utmTerm: get("utm_term", "utmTerm"),
    utmContent: get("utm_content", "utmContent"),
    referrer: stored.referrer ?? document.referrer ?? "",
  };
  try {
    window.sessionStorage.setItem("preee_attribution", JSON.stringify(result));
  } catch {
    // storage unavailable — attribution is best-effort
  }
  return result;
}
