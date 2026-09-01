import Image from "next/image";
import Link from "next/link";
import type { VideoEpisode } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";

export function EpisodeCard({
  episode,
  className,
  wide = false,
}: {
  episode: VideoEpisode;
  className?: string;
  wide?: boolean;
}) {
  const href = `/watch/${episode.slug}`;
  const playable = !episode.comingSoon && Boolean(episode.youtubeId || episode.externalUrl);

  return (
    <article className={cn("group", wide ? "w-72 shrink-0 sm:w-80" : "", className)}>
      <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal">
        <div className="relative aspect-video w-full overflow-hidden bg-ink-soft">
          <Image
            src={episode.poster.src}
            alt={episode.poster.alt}
            fill
            sizes={wide ? "20rem" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/80 text-signal transition-colors group-hover:bg-signal group-hover:text-signal-ink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
              </svg>
            </span>
          </div>
          {episode.runtime ? (
            <span className="absolute bottom-2 right-2 bg-ink/90 px-2 py-1 text-xs font-bold text-paper">
              {episode.runtime}
            </span>
          ) : null}
          {!playable ? (
            <span className="absolute left-2 top-2 bg-signal px-2 py-1 text-xs font-bold uppercase tracking-wider text-signal-ink">
              Coming soon
            </span>
          ) : null}
        </div>
      </Link>
      <div className="pt-3">
        <p className="kicker">{episode.topics[0] ?? "Watch"}</p>
        <h3 className="mt-1 text-base font-bold leading-snug">
          <Link href={href} className="hover:text-signal focus-visible:text-signal">
            {episode.title}
          </Link>
        </h3>
        {episode.guest ? <p className="mt-1 text-sm text-paper-dim">with {episode.guest}</p> : null}
        <p className="mt-1 text-xs text-paper-dim">
          <time dateTime={episode.publishedAt}>{formatDate(episode.publishedAt)}</time>
        </p>
      </div>
    </article>
  );
}
