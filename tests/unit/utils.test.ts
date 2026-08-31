import { describe, expect, it } from "vitest";
import { cn, isSafeUrl, parseYouTubeId, slugify } from "@/lib/utils";
import { buildEventIcs } from "@/lib/ics";
import { leadSchema, newsletterSchema } from "@/lib/leads";

describe("cn", () => {
  it("joins truthy classes", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });
});

describe("isSafeUrl", () => {
  it("accepts https and site-relative paths", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
    expect(isSafeUrl("/calendar")).toBe(true);
  });
  it("rejects unsafe schemes and protocol-relative URLs", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,hi")).toBe(false);
    expect(isSafeUrl("//evil.example")).toBe(false);
    expect(isSafeUrl("")).toBe(false);
  });
});

describe("parseYouTubeId", () => {
  it("accepts bare ids and common url shapes", () => {
    expect(parseYouTubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(parseYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
  it("rejects junk", () => {
    expect(parseYouTubeId("not a video")).toBeNull();
    expect(parseYouTubeId("https://evil.example/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseYouTubeId(undefined)).toBeNull();
  });
});

describe("slugify", () => {
  it("makes clean slugs", () => {
    expect(slugify("Preee's Take: Culture!")).toBe("preees-take-culture");
  });
});

describe("buildEventIcs", () => {
  it("produces a valid single-event calendar", () => {
    const ics = buildEventIcs({
      id: "test-event",
      title: "Test; Event, With\nSpecials",
      category: "Music",
      start: "2026-09-10T20:00:00-04:00",
      timezone: "America/New_York",
      city: "Brooklyn",
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:test-event@preee-tv");
    expect(ics).toContain("DTSTART:20260911T000000Z");
    expect(ics).toContain("Test\\; Event\\, With\\nSpecials");
    expect(ics.endsWith("\r\n")).toBe(true);
  });
});

describe("lead schemas", () => {
  const base = {
    website: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    referrer: "",
    consentAt: new Date().toISOString(),
  };

  it("accepts a valid music submission", () => {
    const result = leadSchema.safeParse({
      ...base,
      type: "submit_music",
      artistName: "Test",
      contactName: "Alex",
      email: "a@example.com",
      phone: "",
      city: "",
      genre: "House",
      songLink: "https://example.com/track",
      additionalLinks: "",
      socialLinks: "",
      releaseStatus: "released",
      story: "A story.",
      agreeTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a filled honeypot", () => {
    const result = leadSchema.safeParse({
      ...base,
      website: "http://spam.example",
      type: "submit_music",
      artistName: "Test",
      contactName: "Alex",
      email: "a@example.com",
      genre: "House",
      songLink: "https://example.com/track",
      releaseStatus: "released",
      story: "A story.",
      agreeTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("requires consent", () => {
    const result = leadSchema.safeParse({
      ...base,
      type: "sponsor",
      contactName: "Taylor",
      email: "b@example.com",
      company: "Acme",
      roleTitle: "",
      budgetRange: "not_sure",
      interests: ["series"],
      message: "Hello",
      agreeTerms: false,
    });
    expect(result.success).toBe(false);
  });

  it("validates newsletter email", () => {
    expect(newsletterSchema.safeParse({ email: "bad", consentAt: "x" }).success).toBe(false);
    expect(
      newsletterSchema.safeParse({
        email: "ok@example.com",
        consentAt: new Date().toISOString(),
        location: "footer",
        website: "",
      }).success,
    ).toBe(true);
  });
});
