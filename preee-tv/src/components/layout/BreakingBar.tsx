"use client";

import { useState } from "react";
import Link from "next/link";
import type { BreakingItem } from "@/lib/types";

/**
 * Slim CMS-driven "now" bar. Dismissal collapses the bar with no layout
 * shift below it (it sits at the very top, above the sticky header, so
 * removing it only moves content up once, on an explicit user action).
 */
export function BreakingBar({ item }: { item: BreakingItem }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const inner = (
    <span className="min-w-0 truncate">
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-live align-middle" aria-hidden />
      <span className="kicker mr-2 text-signal">Now</span>
      <span className="text-sm text-paper">{item.text}</span>
    </span>
  );

  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink-line bg-ink-soft px-4 py-2 sm:px-6">
      {item.href ? (
        <Link href={item.href} className="min-w-0 flex-1 hover:opacity-80">
          {inner}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">{inner}</div>
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss notice"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-paper-dim hover:text-paper"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 5 19 19M19 5 5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
