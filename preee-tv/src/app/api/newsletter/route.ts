import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/leads";
import { getSupabase } from "@/lib/supabase";
import { sendConfirmation } from "@/lib/email";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";
import { BRAND_NAME } from "@/config/site";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Enter a valid email address." },
      { status: 422 },
    );
  }
  const { email, location, consentAt, website } = parsed.data;

  if (website) {
    return NextResponse.json({ ok: true, message: "You're on the list." });
  }

  const clientKey = clientKeyFromHeaders(request.headers);
  if (!rateLimit(`newsletter:${clientKey}`, 8)) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[demo] newsletter signup validated:", email);
      return NextResponse.json({
        ok: true,
        demo: true,
        message: "You're on the list (demo mode — nothing stored).",
      });
    }
    return NextResponse.json(
      { ok: false, message: "Signups open soon — please try again later." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email: email.toLowerCase(),
      location: location || null,
      consent_at: consentAt,
      referrer: request.headers.get("referer") ?? null,
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("Newsletter upsert failed:", error);
    return NextResponse.json(
      { ok: false, message: "We couldn't add you right now. Please try again." },
      { status: 500 },
    );
  }

  await sendConfirmation(
    email,
    `Welcome to the ${BRAND_NAME} Shortlist`,
    `You're in.\n\nThe Shortlist is one email: what we found, why it matters, no filler.\n\nYou don't know about it till we tell you about it.\n\n— ${BRAND_NAME}`,
  );

  return NextResponse.json({ ok: true, message: "You're on the list. Welcome to the shortlist." });
}
