import type { CultureEvent } from "@/lib/types";
import { BRAND_NAME, SITE_URL } from "@/config/site";

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function toIcsUtc(iso: string): string {
  const d = new Date(iso);
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

/** Fold long lines at 74 octets (RFC 5545 allows 75; folding measures bytes, not chars). */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let rest = line;
  while (encoder.encode(rest).length > 74) {
    // Find the longest prefix that fits in 74 octets without splitting a
    // multi-byte character.
    let cut = Math.min(rest.length, 74);
    while (cut > 1 && encoder.encode(rest.slice(0, cut)).length > 74) cut--;
    out.push(rest.slice(0, cut));
    rest = " " + rest.slice(cut);
  }
  out.push(rest);
  return out.join("\r\n");
}

/** Build a single-event ICS file body. */
export function buildEventIcs(event: CultureEvent): string {
  const start = toIcsUtc(event.start);
  const end = event.end
    ? toIcsUtc(event.end)
    : toIcsUtc(new Date(new Date(event.start).getTime() + 2 * 60 * 60 * 1000).toISOString());

  const description = [
    event.description ?? "",
    event.sourceUrl ? `Info: ${event.sourceUrl}` : "",
    event.ticketUrl ? `Tickets/info: ${event.ticketUrl}` : "",
    `Via ${BRAND_NAME} — ${SITE_URL}/calendar`,
  ]
    .filter(Boolean)
    .join("\n");

  const location = [event.venue, event.city].filter(Boolean).join(", ");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${BRAND_NAME}//Culture Calendar//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@preee-tv`,
    `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsEscape(event.title)}`,
    description ? `DESCRIPTION:${icsEscape(description)}` : "",
    location ? `LOCATION:${icsEscape(location)}` : "",
    `URL:${SITE_URL}/calendar`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.map(fold).join("\r\n") + "\r\n";
}
