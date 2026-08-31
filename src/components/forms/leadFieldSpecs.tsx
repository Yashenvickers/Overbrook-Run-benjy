import Link from "next/link";
import type { FieldSpec } from "./LeadForm";

export const submitMusicFields: FieldSpec[] = [
  { name: "artistName", label: "Artist / band name", kind: "text", required: true, autoComplete: "name" },
  { name: "contactName", label: "Your name", kind: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Email", kind: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Phone", kind: "tel", autoComplete: "tel" },
  { name: "city", label: "City / market", kind: "text", placeholder: "Where are you based?" },
  { name: "genre", label: "Genre", kind: "text", required: true, placeholder: "Be specific — 'melodic drill', not just 'rap'" },
  {
    name: "songLink",
    label: "Song link",
    kind: "url",
    required: true,
    placeholder: "https://…",
    help: "One link to the record — streaming, YouTube, or a private stream. No file uploads; links only.",
  },
  {
    name: "additionalLinks",
    label: "Additional links",
    kind: "textarea",
    help: "EPK, press photos, videos — one link per line.",
  },
  { name: "socialLinks", label: "Social profiles", kind: "textarea", help: "One link per line." },
  {
    name: "releaseStatus",
    label: "Release status",
    kind: "select",
    required: true,
    options: [
      { value: "released", label: "Already released" },
      { value: "unreleased", label: "Unreleased" },
      { value: "upcoming", label: "Release date scheduled" },
    ],
  },
  {
    name: "story",
    label: "Tell us about the record",
    kind: "textarea",
    required: true,
    help: "What's the story? Why now? What should we hear first? A real human reads this.",
  },
];

export const requestInterviewFields: FieldSpec[] = [
  { name: "contactName", label: "Your name", kind: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Email", kind: "email", required: true, autoComplete: "email" },
  { name: "company", label: "Company / organization", kind: "text", autoComplete: "organization" },
  {
    name: "role",
    label: "Your role",
    kind: "select",
    required: true,
    options: [
      { value: "artist", label: "Artist (that's me)" },
      { value: "manager", label: "Manager" },
      { value: "publicist", label: "Publicist / PR" },
      { value: "label", label: "Label" },
      { value: "other", label: "Other" },
    ],
  },
  { name: "artistName", label: "Artist / guest name", kind: "text", required: true },
  {
    name: "links",
    label: "Links",
    kind: "textarea",
    required: true,
    help: "Music, socials, press — one link per line. Enough for us to do the homework.",
  },
  {
    name: "pitch",
    label: "The pitch",
    kind: "textarea",
    required: true,
    help: "Why this conversation, and why now? What's the question nobody has asked them yet?",
  },
  { name: "availability", label: "Availability", kind: "text", placeholder: "e.g. In NYC Oct 10–14" },
  { name: "city", label: "City / market", kind: "text" },
];

export const bookPromotionFields: FieldSpec[] = [
  { name: "contactName", label: "Your name", kind: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Email", kind: "email", required: true, autoComplete: "email" },
  { name: "company", label: "Company / label", kind: "text", autoComplete: "organization" },
  { name: "artistOrBrand", label: "Artist / brand being promoted", kind: "text", required: true },
  {
    name: "campaignType",
    label: "Campaign type",
    kind: "select",
    required: true,
    options: [
      { value: "single", label: "Single" },
      { value: "ep_album", label: "EP / album" },
      { value: "video", label: "Video premiere" },
      { value: "event", label: "Event" },
      { value: "tour", label: "Tour" },
      { value: "other", label: "Other" },
    ],
  },
  {
    name: "budgetRange",
    label: "Budget range",
    kind: "select",
    required: true,
    options: [
      { value: "under_1k", label: "Under $1,000" },
      { value: "1k_5k", label: "$1,000 – $5,000" },
      { value: "5k_15k", label: "$5,000 – $15,000" },
      { value: "15k_plus", label: "$15,000+" },
      { value: "not_sure", label: "Not sure yet" },
    ],
  },
  { name: "timeline", label: "Timeline", kind: "text", placeholder: "e.g. Single drops Nov 6" },
  {
    name: "goals",
    label: "Campaign goals",
    kind: "textarea",
    required: true,
    help: "What does success look like? All promotion on Preee TV is clearly labeled — coverage itself is never for sale.",
  },
  { name: "links", label: "Links", kind: "textarea", help: "Music, assets, socials — one per line." },
];

export const sponsorFields: FieldSpec[] = [
  { name: "contactName", label: "Your name", kind: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Email", kind: "email", required: true, autoComplete: "email" },
  { name: "company", label: "Company / brand", kind: "text", required: true, autoComplete: "organization" },
  { name: "roleTitle", label: "Your role", kind: "text", placeholder: "e.g. Brand Partnerships Lead" },
  {
    name: "budgetRange",
    label: "Budget range",
    kind: "select",
    options: [
      { value: "under_5k", label: "Under $5,000" },
      { value: "5k_25k", label: "$5,000 – $25,000" },
      { value: "25k_100k", label: "$25,000 – $100,000" },
      { value: "100k_plus", label: "$100,000+" },
      { value: "not_sure", label: "Not sure yet" },
    ],
    required: true,
  },
  {
    name: "interests",
    label: "What are you interested in?",
    kind: "checkboxGroup",
    required: true,
    options: [
      { value: "series", label: "Series sponsorship" },
      { value: "segments", label: "Segment sponsorship" },
      { value: "events", label: "Events" },
      { value: "newsletter", label: "Newsletter" },
      { value: "other", label: "Something else" },
    ],
  },
  {
    name: "message",
    label: "Your message",
    kind: "textarea",
    required: true,
    help: "Tell us about the brand and what a great partnership looks like to you.",
  },
];

export function StandardTermsNote() {
  return (
    <>
      I agree to the{" "}
      <Link href="/submission-terms" className="underline hover:text-signal">
        submission terms
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className="underline hover:text-signal">
        privacy policy
      </Link>
      , and I confirm I have the rights to share the material linked above.
    </>
  );
}
