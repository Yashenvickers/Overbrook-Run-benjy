import Image from "next/image";
import Link from "next/link";
import {
  BRAND_EDITORIAL_LINE,
  BRAND_HOOK,
  BRAND_NAME,
  BRAND_TAGLINE,
  SITE_URL,
} from "@/config/site";
import {
  getArticles,
  getArtists,
  getEpisodes,
  getUpcomingEvents,
} from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { AdSlot } from "@/components/ui/AdSlot";
import { JsonLd } from "@/components/ui/JsonLd";
import { StoryCard } from "@/components/cards/StoryCard";
import { EpisodeCard } from "@/components/cards/EpisodeCard";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { formatEventDate, formatEventDateTime } from "@/lib/utils";

export default async function HomePage() {
  const [articles, episodes, events, artists] = await Promise.all([
    getArticles(),
    getEpisodes(),
    getUpcomingEvents(4),
    getArtists(),
  ]);

  const featured = articles.filter((a) => a.featured);
  const hero = featured[0] ?? articles[0];
  const secondary = articles.filter((a) => a.slug !== hero?.slug).slice(0, 2);
  const latest = articles
    .filter((a) => a.slug !== hero?.slug && !secondary.some((s) => s.slug === a.slug))
    .slice(0, 8);
  const take = articles.filter((a) => a.category === "culture").slice(0, 3);
  const business = articles.filter((a) => a.category === "business").slice(0, 3);
  const performances = articles.filter((a) => a.category === "performances");
  const performanceEpisodes = episodes.filter((e) =>
    e.topics.some((t) => t.toLowerCase().includes("performance") || t.toLowerCase().includes("mic drop")),
  );
  const spotlight = artists.find((a) => a.spotlight) ?? artists[0];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: BRAND_NAME,
              url: SITE_URL,
              slogan: BRAND_TAGLINE,
              logo: `${SITE_URL}/brand/og-default.jpg`,
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              name: BRAND_NAME,
              url: SITE_URL,
              description: BRAND_EDITORIAL_LINE,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }}
      />

      {/* 1 ── Hero lead + secondary leads */}
      <section aria-label="Lead stories" className="border-b border-ink-line">
        <Container className="py-8">
          <p className="kicker mb-6">{BRAND_EDITORIAL_LINE}</p>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            {hero ? (
              <StoryCard article={hero} variant="hero" priority className="lg:col-span-2" />
            ) : null}
            <div className="flex flex-col gap-8">
              {secondary.map((article) => (
                <StoryCard key={article.slug} article={article} variant="lead" />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <AdSlot id="home-top" />

      {/* 2 ── Latest grid */}
      <section aria-labelledby="latest-heading" className="py-12">
        <Container>
          <SectionHeader kicker="Fresh off the press" id="latest-heading" title="The Latest" href="/latest" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((article) => (
              <StoryCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      </section>

      {/* 3 ── Watch rail */}
      <section aria-labelledby="watch-heading" className="border-y border-ink-line bg-ink-soft py-12">
        <Container>
          <SectionHeader kicker="Press play" id="watch-heading" title="Watch Preee TV" href="/watch" linkLabel="All episodes" />
          <div className="rail">
            {episodes.slice(0, 6).map((episode) => (
              <EpisodeCard key={episode.slug} episode={episode} wide />
            ))}
          </div>
        </Container>
      </section>

      {/* 4 ── Preee's Take */}
      <section aria-labelledby="take-heading" className="py-12">
        <Container>
          <SectionHeader kicker="Culture response" id="take-heading" title="Preee’s Take" href="/culture" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {take.map((article, i) => (
              <article key={article.slug} className="group border border-ink-line p-6 transition-colors hover:border-signal">
                <p className="font-display text-4xl text-signal" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="headline mt-3 text-xl">
                  <Link href={`/stories/${article.slug}`} className="hover:text-signal">
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-sm text-paper-dim">{article.dek}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 5 ── Artist Spotlight */}
      {spotlight ? (
        <section aria-labelledby="spotlight-heading" className="border-y-2 border-signal bg-ink-soft py-12">
          <Container>
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
              <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden bg-ink">
                <Image
                  src={spotlight.image.src}
                  alt={spotlight.image.alt}
                  fill
                  sizes="(min-width: 768px) 28rem, 100vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="kicker mb-2">Artist Spotlight</p>
                <h2 id="spotlight-heading" className="headline text-3xl sm:text-5xl">
                  {spotlight.name}
                </h2>
                {spotlight.origin || spotlight.genre ? (
                  <p className="mt-2 text-sm font-bold uppercase tracking-wider text-paper-dim">
                    {[spotlight.origin, spotlight.genre].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                <p className="mt-4 max-w-prose text-paper-dim">{spotlight.oneLiner}</p>
                {spotlight.bio ? <p className="mt-3 max-w-prose text-sm text-paper-dim">{spotlight.bio}</p> : null}
                <div className="mt-6">
                  <ButtonLink href="/submit-music">Submit your music</ButtonLink>
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* 6 ── Performances / Mic Drop */}
      <section aria-labelledby="micdrop-heading" className="py-12">
        <Container>
          <SectionHeader kicker="Live moments" id="micdrop-heading" title="Mic Drop" href="/performances" />
          <div className="rail">
            {performanceEpisodes.map((episode) => (
              <EpisodeCard key={episode.slug} episode={episode} wide />
            ))}
            {performances.map((article) => (
              <div key={article.slug} className="w-72 shrink-0 sm:w-80">
                <StoryCard article={article} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 7 ── Culture Calendar preview */}
      <section aria-labelledby="calendar-heading" className="border-y border-ink-line bg-ink-soft py-12">
        <Container>
          <SectionHeader kicker="Plan around the moments" id="calendar-heading" title="Culture Calendar" href="/calendar" linkLabel="Full calendar" />
          <ol className="divide-y divide-ink-line">
            {events.map((event) => (
              <li key={event.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <p className="kicker">{event.category}</p>
                  <p className="mt-1 font-bold text-paper">
                    <Link href={`/calendar?event=${encodeURIComponent(event.id)}`} className="hover:text-signal">
                      {event.title}
                    </Link>
                  </p>
                  {event.city ? <p className="text-sm text-paper-dim">{event.city}</p> : null}
                </div>
                <p className="shrink-0 text-sm text-paper-dim">
                  {event.end
                    ? `${formatEventDate(event.start, event.timezone)} – ${formatEventDate(event.end, event.timezone)}`
                    : formatEventDateTime(event.start, event.timezone)}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 8 ── The Business */}
      <section aria-labelledby="business-heading" className="py-12">
        <Container>
          <SectionHeader kicker="Follow the money" id="business-heading" title="The Business" href="/business" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {business.map((article) => (
              <StoryCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      </section>

      <AdSlot id="home-mid" />

      {/* 9 ── Newsletter */}
      <section aria-labelledby="newsletter-heading" className="border-y-2 border-paper bg-signal py-14 text-signal-ink">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-kicker font-bold uppercase tracking-widest">The Shortlist</p>
            <h2 id="newsletter-heading" className="headline mt-2 text-3xl sm:text-4xl">
              {BRAND_HOOK}
            </h2>
            <p className="mt-4 text-signal-ink/80">
              One email. The records, moments, and moves worth your attention — before the feed decides for you.
            </p>
            <div className="mx-auto mt-6 max-w-md text-left [&_input]:border-signal-ink/40 [&_input]:bg-transparent [&_input]:text-signal-ink [&_input]:placeholder:text-signal-ink/50 [&_button]:bg-signal-ink [&_button]:text-signal [&_p]:text-signal-ink/70">
              <NewsletterForm location="homepage" compact />
            </div>
          </div>
        </Container>
      </section>

      {/* 10 ── Conversion quad */}
      <section aria-labelledby="workwithus-heading" className="py-14">
        <Container>
          <h2 id="workwithus-heading" className="sr-only">
            Work with {BRAND_NAME}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/submit-music",
                kicker: "Artists",
                title: "Submit Music",
                copy: "A real human listens to everything. Put your record in front of the desk.",
              },
              {
                href: "/request-interview",
                kicker: "Talent & PR",
                title: "Request an Interview",
                copy: "Put your artist in the chair for a researched, long-form conversation.",
              },
              {
                href: "/book-promotion",
                kicker: "Campaigns",
                title: "Book Promotion",
                copy: "Labeled, honest promotion across Preee TV inventory. No pay-for-play posturing.",
              },
              {
                href: "/sponsor",
                kicker: "Brands",
                title: "Sponsor Preee TV",
                copy: "Back the platform culture actually watches. Series, segments, and events.",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex min-h-44 flex-col justify-between border border-ink-line p-6 transition-colors hover:border-signal focus-visible:border-signal"
              >
                <div>
                  <p className="kicker">{card.kicker}</p>
                  <p className="headline mt-2 text-xl group-hover:text-signal">{card.title}</p>
                  <p className="mt-2 text-sm text-paper-dim">{card.copy}</p>
                </div>
                <p className="mt-4 text-sm font-bold uppercase tracking-wider text-signal">
                  Start <span aria-hidden>→</span>
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
