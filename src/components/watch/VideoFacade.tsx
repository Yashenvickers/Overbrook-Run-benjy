"use client";

import { useState } from "react";
import Image from "next/image";
import type { VideoEpisode } from "@/lib/types";
import { track } from "@/lib/analytics";
import { isSafeUrl, parseYouTubeId } from "@/lib/utils";

/**
 * Poster-first YouTube facade: no third-party bytes load until the viewer
 * explicitly presses play. Dimensions are reserved (aspect-video) so the
 * swap causes zero layout shift. Renders a polished "coming soon" state when
 * no video source is configured.
 */
export function VideoFacade({ episode }: { episode: VideoEpisode }) {
  const [playing, setPlaying] = useState(false);
  // An episode marked "coming soon" never renders a player, even if a video
  // source is already configured for the premiere.
  const youtubeId = episode.comingSoon
    ? null
    : parseYouTubeId(episode.youtubeId ?? episode.externalUrl ?? undefined);
  const externalOnly =
    !episode.comingSoon && !youtubeId && episode.externalUrl && isSafeUrl(episode.externalUrl)
      ? episode.externalUrl
      : null;

  if (playing && youtubeId) {
    return (
      <div className="relative aspect-video w-full bg-ink-soft">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={episode.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  const poster = (
    <div className="relative aspect-video w-full overflow-hidden bg-ink-soft">
      <Image
        src={episode.poster.src}
        alt={episode.poster.alt}
        fill
        priority
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="object-cover"
      />
      {youtubeId || externalOnly ? (
        <div className="absolute inset-0 bg-ink/20" aria-hidden />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/70 p-6 text-center">
          <p className="kicker mb-2">Coming soon</p>
          <p className="max-w-md font-display text-xl uppercase leading-tight text-paper sm:text-2xl">
            This episode premieres soon.
          </p>
          <p className="mt-3 text-sm text-paper-dim">
            Join the newsletter and we&apos;ll tell you the moment it drops.
          </p>
        </div>
      )}
    </div>
  );

  if (youtubeId) {
    return (
      <button
        type="button"
        onClick={() => {
          setPlaying(true);
          track("video_start", { slug: episode.slug });
        }}
        aria-label={`Play ${episode.title}`}
        className="group relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
      >
        {poster}
        <span
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-signal text-signal-ink transition-transform group-hover:scale-110"
          aria-hidden
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.5v13l11-6.5-11-6.5Z" />
          </svg>
        </span>
      </button>
    );
  }

  if (externalOnly) {
    return (
      <a
        href={externalOnly}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("video_start", { slug: episode.slug })}
        className="group relative block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
        aria-label={`Watch ${episode.title} (opens in a new tab)`}
      >
        {poster}
        <span
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-signal text-signal-ink transition-transform group-hover:scale-110"
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M14 4h6v6M20 4l-9 9M11 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </a>
    );
  }

  return poster;
}
