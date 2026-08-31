"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CultureEvent, EventCategory } from "@/lib/types";
import { formatEventDateTime, formatEventDate, isSafeUrl, cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

const CATEGORIES: EventCategory[] = [
  "Music",
  "Culture",
  "Industry",
  "Release",
  "Festival",
  "Award Show",
  "Community",
  "Preee TV",
];

type Mode = "list" | "month";

/** Local YYYY-MM-DD for an event in its own timezone. */
function eventDayKey(iso: string, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: timezone || undefined,
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1),
  );
}

export function CalendarView({
  events,
  initialEventId,
}: {
  events: CultureEvent[];
  initialEventId?: string;
}) {
  const [mode, setMode] = useState<Mode>("list");
  const [category, setCategory] = useState<EventCategory | "All">("All");
  const [city, setCity] = useState<string>("All");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [openEvent, setOpenEvent] = useState<CultureEvent | null>(
    () => events.find((e) => e.id === initialEventId) ?? null,
  );
  const now = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const cities = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => e.city && set.add(e.city));
    return ["All", ...Array.from(set).sort()];
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (category !== "All" && e.category !== category) return false;
      if (city !== "All" && e.city !== city) return false;
      const start = new Date(e.start).getTime();
      const end = e.end ? new Date(e.end).getTime() : start;
      if (from && end < new Date(`${from}T00:00:00`).getTime()) return false;
      if (to && start > new Date(`${to}T23:59:59`).getTime()) return false;
      return true;
    });
  }, [events, category, city, from, to]);

  const upcoming = useMemo(() => {
    const nowMs = Date.now();
    return filtered.filter((e) => {
      const end = e.end ? new Date(e.end).getTime() : new Date(e.start).getTime();
      return end >= nowMs - 24 * 60 * 60 * 1000;
    });
  }, [filtered]);

  const openDrawer = useCallback((event: CultureEvent, trigger?: HTMLElement | null) => {
    lastTriggerRef.current = trigger ?? null;
    setOpenEvent(event);
    track("calendar_event_open", { eventId: event.id });
  }, []);

  const closeDrawer = useCallback(() => {
    setOpenEvent(null);
    lastTriggerRef.current?.focus();
  }, []);

  // Drawer: Escape to close, focus moves in.
  useEffect(() => {
    if (!openEvent) return;
    drawerRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openEvent, closeDrawer]);

  // Month grid data
  const monthGrid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: { day: number | null; key: string; events: CultureEvent[] }[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null, key: `pad-${i}`, events: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        day: d,
        key,
        events: filtered.filter((e) => eventDayKey(e.start, e.timezone) === key),
      });
    }
    return cells;
  }, [viewYear, viewMonth, filtered]);

  const featured = upcoming.filter((e) => e.featured).slice(0, 2);

  return (
    <div>
      {/* Featured */}
      {featured.length > 0 ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featured.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={(ev) => openDrawer(e, ev.currentTarget)}
              className="group border-2 border-signal p-6 text-left transition-colors hover:bg-ink-soft"
            >
              <p className="kicker">{e.category} · Featured</p>
              <p className="headline mt-2 text-xl group-hover:text-signal sm:text-2xl">{e.title}</p>
              <p className="mt-2 text-sm text-paper-dim">
                {formatEventDateTime(e.start, e.timezone)}
                {e.city ? ` · ${e.city}` : ""}
              </p>
            </button>
          ))}
        </div>
      ) : null}

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c as EventCategory | "All")}
              aria-pressed={category === c}
              className={cn(
                "min-h-11 border px-3 text-sm font-bold uppercase tracking-wider transition-colors",
                category === c
                  ? "border-signal bg-signal text-signal-ink"
                  : "border-ink-line text-paper-dim hover:border-signal hover:text-signal",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="mb-1 block font-bold">City / market</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="min-h-11 border border-ink-line bg-ink px-3 text-paper focus:border-signal focus:outline-none"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-bold">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="min-h-11 border border-ink-line bg-ink px-3 text-paper focus:border-signal focus:outline-none"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-bold">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="min-h-11 border border-ink-line bg-ink px-3 text-paper focus:border-signal focus:outline-none"
            />
          </label>
          <div className="ml-auto flex" role="group" aria-label="View mode">
            {(["list", "month"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={cn(
                  "min-h-11 border px-4 text-sm font-bold uppercase tracking-wider",
                  mode === m
                    ? "border-signal bg-signal text-signal-ink"
                    : "border-ink-line text-paper-dim hover:text-signal",
                )}
              >
                {m === "list" ? "List" : "Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List mode */}
      {mode === "list" ? (
        upcoming.length > 0 ? (
          <ol className="divide-y divide-ink-line border-t border-ink-line">
            {upcoming.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={(ev) => openDrawer(e, ev.currentTarget)}
                  className="group flex w-full flex-col gap-1 py-4 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                >
                  <span className="min-w-0">
                    <span className="kicker">{e.category}</span>
                    <span className="mt-1 block font-bold text-paper group-hover:text-signal">
                      {e.title}
                    </span>
                    {e.city ? <span className="text-sm text-paper-dim">{e.city}</span> : null}
                  </span>
                  <span className="shrink-0 text-sm text-paper-dim">
                    {e.end
                      ? `${formatEventDate(e.start, e.timezone)} – ${formatEventDate(e.end, e.timezone)}`
                      : formatEventDateTime(e.start, e.timezone)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="border border-ink-line p-8 text-center text-paper-dim">
            No events match these filters. Try widening the dates or clearing the category.
          </p>
        )
      ) : (
        /* Month mode */
        <div>
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const m = viewMonth - 1;
                if (m < 0) {
                  setViewMonth(11);
                  setViewYear((y) => y - 1);
                } else setViewMonth(m);
              }}
              className="inline-flex h-11 min-w-11 items-center justify-center border border-ink-line px-3 font-bold hover:border-signal hover:text-signal"
              aria-label="Previous month"
            >
              ←
            </button>
            <p className="headline text-xl">{monthLabel(viewYear, viewMonth)}</p>
            <button
              type="button"
              onClick={() => {
                const m = viewMonth + 1;
                if (m > 11) {
                  setViewMonth(0);
                  setViewYear((y) => y + 1);
                } else setViewMonth(m);
              }}
              className="inline-flex h-11 min-w-11 items-center justify-center border border-ink-line px-3 font-bold hover:border-signal hover:text-signal"
              aria-label="Next month"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-px overflow-x-auto border border-ink-line bg-ink-line text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="bg-ink-soft p-2 text-center font-bold uppercase text-paper-dim">
                <span aria-hidden>{d.slice(0, 1)}</span>
                <span className="sr-only">{d}</span>
              </div>
            ))}
            {monthGrid.map((cell) => (
              <div key={cell.key} className="min-h-16 bg-ink p-1 sm:min-h-24 sm:p-2">
                {cell.day ? (
                  <>
                    <p className="text-paper-dim">{cell.day}</p>
                    <div className="mt-1 space-y-1">
                      {cell.events.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={(ev) => openDrawer(e, ev.currentTarget)}
                          className="block w-full truncate bg-signal px-1 py-0.5 text-left text-[10px] font-bold text-signal-ink hover:bg-paper sm:text-xs"
                          title={e.title}
                        >
                          {e.title}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {openEvent ? (
        <div className="fixed inset-0 z-[60]" role="presentation">
          <button
            type="button"
            aria-label="Close event details"
            onClick={closeDrawer}
            className="absolute inset-0 bg-ink/80"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={openEvent.title}
            className="absolute bottom-0 left-0 right-0 max-h-[85dvh] overflow-y-auto border-t-2 border-signal bg-ink-soft p-6 sm:bottom-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[28rem] sm:border-l-2 sm:border-t-0"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="kicker">{openEvent.category}</p>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-paper-dim hover:text-paper"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 5 19 19M19 5 5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <h2 className="headline mt-2 text-2xl">{openEvent.title}</h2>
            <p className="mt-3 text-sm text-paper">
              {openEvent.end
                ? `${formatEventDateTime(openEvent.start, openEvent.timezone)} – ${formatEventDateTime(openEvent.end, openEvent.timezone)}`
                : formatEventDateTime(openEvent.start, openEvent.timezone)}
            </p>
            {openEvent.venue || openEvent.city ? (
              <p className="mt-1 text-sm text-paper-dim">
                {[openEvent.venue, openEvent.city].filter(Boolean).join(", ")}
              </p>
            ) : null}
            {openEvent.description ? (
              <p className="mt-4 text-sm leading-relaxed text-paper-dim">{openEvent.description}</p>
            ) : null}
            {openEvent.ticketsAvailable === true ? (
              <p className="mt-3 text-sm font-bold text-signal">Tickets available</p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={`/api/calendar/ics/${encodeURIComponent(openEvent.id)}`}
                onClick={() => track("calendar_add", { eventId: openEvent.id })}
                className="inline-flex min-h-11 items-center bg-signal px-4 text-sm font-bold uppercase tracking-wider text-signal-ink hover:bg-paper"
              >
                Add to calendar
              </a>
              {openEvent.ticketUrl && isSafeUrl(openEvent.ticketUrl) ? (
                <a
                  href={openEvent.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("outbound_click", { url: openEvent.ticketUrl! })}
                  className="inline-flex min-h-11 items-center border-2 border-paper px-4 text-sm font-bold uppercase tracking-wider text-paper hover:border-signal hover:text-signal"
                >
                  Tickets / info
                </a>
              ) : null}
              {openEvent.sourceUrl && isSafeUrl(openEvent.sourceUrl) ? (
                <a
                  href={openEvent.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("outbound_click", { url: openEvent.sourceUrl! })}
                  className="inline-flex min-h-11 items-center border border-ink-line px-4 text-sm font-bold uppercase tracking-wider text-paper-dim hover:border-signal hover:text-signal"
                >
                  Source
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
