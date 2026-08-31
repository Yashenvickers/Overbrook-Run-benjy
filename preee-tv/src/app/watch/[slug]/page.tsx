import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getEpisodeBySlug, getEpisodes } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/ui/JsonLd";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { VideoFacade } from "@/components/watch/VideoFacade";
import { EpisodeCard } from "@/components/cards/EpisodeCard";
import { StoryCard } from "@/components/cards/StoryCard";
import { ShareActions } from "@/components/article/ShareActions";
import { formatDate } from "@/lib/utils";
import { BRAND_NAME, SITE_URL } from "@/config/site";
import type { Article } from "@/lib/types";

export async function generateStaticParams() {
  const episodes = await getEpisodes();
  return episodes.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);
  if (!episode) return { title: "Episode not found" };
  return {
    title: episode.title,
    description: episode.description,
    alternates: { canonical: `/watch/${episode.slug}` },
    openGraph: {
      type: "video.other",
      title: episode.title,
      description: episode.description,
      url: `${SITE_URL}/watch/${episode.slug}`,
      images: [{ url: episode.poster.src }],
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);
  if (!episode) notFound();

  const all = await getEpisodes();
  const relatedClips = all.filter((e) => e.slug !== episode.slug).slice(0, 3);
  const relatedArticles = (
    await Promise.all((episode.relatedArticleSlugs ?? []).map((s) => getArticleBySlug(s)))
  ).filter((a): a is Article => a !== null);
  const path = `/watch/${episode.slug}`;

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: episode.title,
          description: episode.description,
          thumbnailUrl: episode.poster.src.startsWith("http")
            ? episode.poster.src
            : `${SITE_URL}${episode.poster.src}`,
          uploadDate: episode.publishedAt,
          publisher: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
          ...(episode.youtubeId
            ? { embedUrl: `https://www.youtube-nocookie.com/embed/${episode.youtubeId}` }
            : {}),
        }}
      />
      <Container className="py-10">
        <div className="mx-auto max-w-4xl">
          <VideoFacade episode={episode} />

          <header className="mt-6">
            <p className="kicker">{episode.topics.join(" · ") || "Watch"}</p>
            <h1 className="headline mt-2 text-3xl sm:text-4xl">{episode.title}</h1>
            {episode.guest ? (
              <p className="mt-2 text-lg text-paper-dim">with {episode.guest}</p>
            ) : null}
            {episode.sponsorDisclosure ? (
              <p className="mt-4 border-2 border-signal bg-ink-soft px-4 py-3 text-sm font-bold text-signal">
                Sponsored: {episode.sponsorDisclosure}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-y border-ink-line py-3 text-sm text-paper-dim">
              <time dateTime={episode.publishedAt}>{formatDate(episode.publishedAt)}</time>
              {episode.runtime ? <span>· {episode.runtime}</span> : null}
            </div>
          </header>

          <p className="mt-6 max-w-prose text-paper-dim">{episode.description}</p>

          <div className="mt-8">
            <ShareActions slug={episode.slug} title={episode.title} path={path} />
          </div>

          {episode.transcript ? (
            <details className="mt-8 border border-ink-line">
              <summary className="cursor-pointer px-5 py-4 font-bold uppercase tracking-wider hover:text-signal">
                Transcript
              </summary>
              <div className="whitespace-pre-wrap border-t border-ink-line px-5 py-4 text-sm leading-relaxed text-paper-dim">
                {episode.transcript}
              </div>
            </details>
          ) : null}

          <aside className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="border border-ink-line p-6">
              <p className="kicker mb-2">Artists</p>
              <p className="mb-4 text-sm text-paper-dim">
                Want your record on the desk? A real human listens to everything.
              </p>
              <ButtonLink href="/submit-music" variant="secondary">
                Submit music
              </ButtonLink>
            </div>
            <div className="border border-ink-line p-6">
              <p className="kicker mb-2">Talent & PR</p>
              <p className="mb-4 text-sm text-paper-dim">
                Put your artist in the chair for a researched conversation.
              </p>
              <ButtonLink href="/request-interview" variant="secondary">
                Request an interview
              </ButtonLink>
            </div>
          </aside>

          {relatedArticles.length > 0 ? (
            <section aria-label="Related stories" className="mt-14 border-t-2 border-paper pt-8">
              <h2 className="headline mb-6 text-2xl">Read next</h2>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {relatedArticles.map((a) => (
                  <StoryCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          ) : null}

          {relatedClips.length > 0 ? (
            <section aria-label="More episodes" className="mt-14 border-t border-ink-line pt-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="headline text-2xl">More to watch</h2>
                <Link href="/watch" className="text-sm font-bold uppercase tracking-wider text-paper-dim hover:text-signal">
                  All episodes →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {relatedClips.map((e) => (
                  <EpisodeCard key={e.slug} episode={e} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </Container>
    </article>
  );
}
