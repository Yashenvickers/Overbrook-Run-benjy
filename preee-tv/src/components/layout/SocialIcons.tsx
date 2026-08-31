import { SOCIAL_LINKS, type SocialPlatform } from "@/config/site";
import { isSafeUrl } from "@/lib/utils";

const LABELS: Record<SocialPlatform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  x: "X",
  threads: "Threads",
};

const ICONS: Record<SocialPlatform, React.ReactNode> = {
  youtube: (
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" fill="currentColor" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="17.2" cy="6.8" r="1.3" fill="currentColor" />
    </>
  ),
  tiktok: (
    <path d="M16.6 3c.4 2.1 1.7 3.5 3.9 3.7v2.8c-1.5.1-2.9-.4-3.9-1.2v5.9a5.8 5.8 0 1 1-5.8-5.8c.3 0 .7 0 1 .1v2.9a2.9 2.9 0 1 0 2 2.8V3h2.8Z" fill="currentColor" />
  ),
  facebook: (
    <path d="M14 8.5V7c0-.8.2-1.2 1.3-1.2H17V3h-2.6C11.6 3 10.5 4.4 10.5 7v1.5H8.5v3h2V21H14v-9.5h2.5l.4-3H14Z" fill="currentColor" />
  ),
  x: (
    <path d="M17.7 3H21l-7.3 8.3L22 21h-6.6l-5.2-6.2L4.3 21H1l7.8-8.9L1.5 3h6.8l4.7 5.6L17.7 3Zm-1.2 16h1.8L7.4 4.9H5.5L16.5 19Z" fill="currentColor" />
  ),
  threads: (
    <path d="M12.5 21c-4.8 0-7.8-3.2-7.8-9s3-9 7.8-9c3.7 0 6.3 1.8 7.2 5l-2.3.6c-.6-2.2-2.3-3.4-4.9-3.4-3.4 0-5.4 2.4-5.4 6.8s2 6.8 5.4 6.8c2.4 0 4-1.1 4.2-2.9.1-1.1-.5-2-2.2-2.3a7 7 0 0 0-2.5.1l-.5-2c1-.3 2.1-.4 3.2-.2 2.8.4 4.5 2.2 4.3 4.6-.3 3-2.9 4.9-6.5 4.9Z" fill="currentColor" />
  ),
};

/** Hidden entirely until real handles are configured — never links to "#". */
export function SocialIcons({ className }: { className?: string }) {
  const active = SOCIAL_LINKS.filter((s) => s.url && isSafeUrl(s.url));
  if (active.length === 0) return null;
  return (
    <ul className={className ?? "flex items-center gap-2"}>
      {active.map(({ platform, url }) => (
        <li key={platform}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={LABELS[platform]}
            className="inline-flex h-11 w-11 items-center justify-center text-paper-dim transition-colors hover:text-signal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              {ICONS[platform]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
