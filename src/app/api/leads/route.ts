import { NextRequest, NextResponse } from "next/server";
import { leadSchema, type LeadPayload } from "@/lib/leads";
import { getSupabase } from "@/lib/supabase";
import { sendConfirmation, sendInternalNotification } from "@/lib/email";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";
import { BRAND_NAME } from "@/config/site";

export const runtime = "nodejs";

const LEAD_LABELS: Record<LeadPayload["type"], string> = {
  submit_music: "Music submission",
  request_interview: "Interview request",
  book_promotion: "Promotion inquiry",
  sponsor: "Sponsorship inquiry",
};

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured — skip
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function summarize(payload: LeadPayload): string {
  const lines: string[] = [`Type: ${LEAD_LABELS[payload.type]}`];
  for (const [key, value] of Object.entries(payload)) {
    if (
      ["type", "website", "turnstileToken", "agreeTerms"].includes(key) ||
      value === "" ||
      value === undefined
    ) {
      continue;
    }
    lines.push(`${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`);
  }
  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field — swallow silently with a fake success.
  if (
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    typeof (body as { website?: unknown }).website === "string" &&
    (body as { website: string }).website.length > 0
  ) {
    return NextResponse.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, message: first?.message ?? "Please check the form and try again." },
      { status: 422 },
    );
  }
  const payload = parsed.data;

  const clientKey = clientKeyFromHeaders(request.headers);
  const limit = process.env.NODE_ENV === "production" ? 5 : 50;
  if (!rateLimit(`leads:${payload.type}:${clientKey}`, limit)) {
    return NextResponse.json(
      { ok: false, message: "Too many submissions. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  const human = await verifyTurnstile(payload.turnstileToken, clientKey);
  if (!human) {
    return NextResponse.json(
      { ok: false, message: "Bot check failed. Refresh the page and try again." },
      { status: 403 },
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    // No backend configured: simulate success in development only.
    if (process.env.NODE_ENV !== "production") {
      console.info(`[demo] ${LEAD_LABELS[payload.type]} validated:`, payload.email);
      return NextResponse.json({ ok: true, demo: true });
    }
    return NextResponse.json(
      { ok: false, message: "This form isn't accepting submissions yet. Please try again soon." },
      { status: 503 },
    );
  }

  const { website: _hp, turnstileToken: _tok, ...record } = payload;
  const { error } = await supabase.from("leads").insert({
    type: payload.type,
    email: payload.email,
    contact_name: payload.contactName,
    payload: record,
    utm: {
      source: payload.utmSource || null,
      medium: payload.utmMedium || null,
      campaign: payload.utmCampaign || null,
      term: payload.utmTerm || null,
      content: payload.utmContent || null,
    },
    referrer: payload.referrer || null,
    consent_at: payload.consentAt,
    user_agent: request.headers.get("user-agent") ?? null,
  });

  if (error) {
    console.error("Lead insert failed:", error);
    return NextResponse.json(
      { ok: false, message: "We couldn't save your submission. Please try again." },
      { status: 500 },
    );
  }

  const label = LEAD_LABELS[payload.type];
  await sendInternalNotification(
    `[${BRAND_NAME}] New ${label.toLowerCase()}: ${payload.contactName}`,
    summarize(payload),
  );
  await sendConfirmation(
    payload.email,
    `${BRAND_NAME} — we received your ${label.toLowerCase()}`,
    `Thanks, ${payload.contactName}.\n\nYour ${label.toLowerCase()} is on the desk at ${BRAND_NAME}. A real human reviews everything; if it's a fit, we'll reach out at this address.\n\n— ${BRAND_NAME}`,
  );

  return NextResponse.json({ ok: true });
}
