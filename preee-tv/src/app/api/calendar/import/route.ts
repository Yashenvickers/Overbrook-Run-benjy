import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Protected JSON import endpoint for future calendar automation.
 * Auth: server-side shared secret via the `x-preee-import-secret` header.
 * Validated with Zod; events are stored in Supabase (table: imported_events)
 * for editorial review before publication — imports never go straight to the
 * public calendar.
 */
const importedEventSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().min(1).max(300),
  category: z.enum([
    "Music",
    "Culture",
    "Industry",
    "Release",
    "Festival",
    "Award Show",
    "Community",
    "Preee TV",
  ]),
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }).optional(),
  timezone: z.string().min(1).max(64),
  city: z.string().max(120).optional(),
  venue: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  sourceUrl: z.string().url().startsWith("http").optional(),
  ticketUrl: z.string().url().startsWith("http").optional(),
  ticketsAvailable: z.boolean().optional(),
});

const importPayloadSchema = z.object({
  source: z.string().min(1).max(120),
  events: z.array(importedEventSchema).min(1).max(200),
});

export async function POST(request: NextRequest) {
  const secret = process.env.CALENDAR_IMPORT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "Import endpoint is not enabled." },
      { status: 503 },
    );
  }
  const provided = request.headers.get("x-preee-import-secret");
  if (!provided || provided !== secret) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = importPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Validation failed.", issues: parsed.error.issues.slice(0, 10) },
      { status: 422 },
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Storage backend is not configured." },
      { status: 503 },
    );
  }

  const rows = parsed.data.events.map((e) => ({
    external_id: e.id,
    source: parsed.data.source,
    payload: e,
  }));
  const { error } = await supabase
    .from("imported_events")
    .upsert(rows, { onConflict: "external_id,source" });

  if (error) {
    console.error("Calendar import failed:", error);
    return NextResponse.json({ ok: false, message: "Import failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, imported: rows.length });
}
