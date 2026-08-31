"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { absoluteUrl } from "@/lib/utils";

/**
 * Share + copy-link actions. Uses the native share sheet where available,
 * with explicit intent links as the universal fallback. No hover-only UI.
 */
export function ShareActions({ slug, title, path }: { slug: string; title: string; path: string }) {
  const [copied, setCopied] = useState(false);
  // Set after mount to avoid a server/client hydration mismatch.
  const [canNativeShare, setCanNativeShare] = useState(false);
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);
  const url = absoluteUrl(path);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("share_click", { slug, channel: "copy_link" });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard unavailable (permissions) — show the URL for manual copy.
      window.prompt("Copy this link:", url);
    }
  }

  async function nativeShare() {
    track("share_click", { slug, channel: "native" });
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      // user cancelled — fine
    }
  }

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share this story">
      <span className="kicker mr-1">Share</span>
      {canNativeShare ? (
        <button
          type="button"
          onClick={nativeShare}
          className="inline-flex min-h-11 items-center gap-1 border border-ink-line px-3 text-sm font-bold text-paper transition-colors hover:border-signal hover:text-signal"
        >
          Share…
        </button>
      ) : null}
      <a
        href={`https://x.com/intent/post?url=${encoded}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("share_click", { slug, channel: "x" })}
        className="inline-flex min-h-11 items-center border border-ink-line px-3 text-sm font-bold text-paper transition-colors hover:border-signal hover:text-signal"
      >
        Post on X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("share_click", { slug, channel: "facebook" })}
        className="inline-flex min-h-11 items-center border border-ink-line px-3 text-sm font-bold text-paper transition-colors hover:border-signal hover:text-signal"
      >
        Facebook
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-11 items-center border border-ink-line px-3 text-sm font-bold text-paper transition-colors hover:border-signal hover:text-signal"
        aria-live="polite"
      >
        {copied ? "✓ Copied" : "Copy link"}
      </button>
    </div>
  );
}
