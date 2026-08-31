import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/content";
import { buildEventIcs } from "@/lib/ics";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const events = await getEvents();
  const event = events.find((e) => e.id === id);
  if (!event) {
    return NextResponse.json({ ok: false, message: "Event not found." }, { status: 404 });
  }
  const ics = buildEventIcs(event);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.id}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
