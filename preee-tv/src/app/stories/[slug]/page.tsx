import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { CategoryBadge, categoryLabel } from "@/components/ui/CategoryBadge";
import { JsonLd } from "@/components/ui/JsonLd";
import { ArticleBody } from "@/components/article/ArticleBody";
import { ShareActions } from "@/components/article/ShareActions";
import { StoryViewTracker } from "@/components/article/StoryViewTracker";
import { StoryCard } from "@/components/cards/StoryCard";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { formatDate, isSafeUrl } from "@/lib/utils";
import { BRAND_NAME, SITE_URL } from "@/config/site";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Story not found" };
  return {
    title: article.title,
    description: article.dek,
    alternates: { canonical: `/stories/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.dek,
      url: `${SITE_URL}/stories/${article.slug}`,
      images: [{ url: article.hero.src }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.dek,
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const all = await getArticles();
  const related = all
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3);
  const currentIndex = all.findIndex((a) => a.slug === article.slug);
  const nextStory = all[currentIndex + 1] ?? all[0];
  const path = `/stories/${article.slug}`;

  return (
    <article>
      <StoryViewTracker slug={article.slug} category={article.category} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": article.evergreen ? "Article" : "NewsArticle",
          headline: article.title,
          description: article.dek,
          image: [
            article.hero.src.startsWith("http")
              ? article.hero.src
              : `${SITE_URL}${article.hero.src}`,
          ],
          datePublished: article.publishedAt,
          dateModified: article.updatedAt ?? article.publishedAt,
          author: { "@type": "Organization", name: article.author.name },
          publisher: { "@type": "Organization", name: BRAND_NAME, url: SITE_URL },
          mainEntityOfPage: `${SITE_URL}${path}`,
          articleSection: categoryLabel(article.category),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: BRAND_NAME, item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: categoryLabel(article.category),
              item: `${SITE_URL}/${article.category}`,
            },
            { "@type": "ListItem", position: 3, name: article.title, item: `${SITE_URL}${path}` },
          ],
        }}
      />

      <Container className="py-10">
        <header className="mx-auto max-w-3xl">
          <CategoryBadge category={article.category} />
          <h1 className="headline mt-3 text-3xl sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg text-paper-dim">{article.dek}</p>
          {article.sponsorDisclosure ? (
            <p className="mt-4 border-2 border-signal bg-ink-soft px-4 py-3 text-sm font-bold text-signal">
              Sponsored: {article.sponsorDisclosure}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-ink-line py-3 text-sm text-paper-dim">
            <span className="font-bold text-paper">{article.author.name}</span>
            {article.author.role ? <span>· {article.author.role}</span> : null}
            <span>
              · Published <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            </span>
            {article.updatedAt ? (
              <span>
                · Updated <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
              </span>
            ) : null}
          </div>
        </header>

        <figure className="mx-auto mt-8 max-w-4xl">
          <div className="relative aspect-video w-full overflow-hidden bg-ink-soft">
            <Image
              src={article.hero.src}
              alt={article.hero.alt}
              fill
              priority
              sizes="(min-width: 1024px) 56rem, 100vw"
              className="object-cover"
            />
          </div>
          {article.hero.credit ? (
            <figcaption className="mt-2 text-xs text-paper-dim">
              {article.hero.alt} — Credit: {article.hero.credit}
            </figcaption>
          ) : null}
        </figure>

        {article.correction ? (
          <aside className="mx-auto mt-8 max-w-prose border-l-4 border-live bg-ink-soft p-4">
            <p className="kicker mb-1 text-live">Correction · {formatDate(article.correction.date)}</p>
            <p className="text-sm text-paper-dim">{article.correction.note}</p>
          </aside>
        ) : null}

        <div className="mx-auto mt-10 max-w-prose">
          <ArticleBody article={article} />

          {article.sourceLinks && article.sourceLinks.length > 0 ? (
            <aside className="mt-10 border border-ink-line p-5">
              <h2 className="kicker mb-3">Sources</h2>
              <ul className="space-y-2">
                {article.sourceLinks.filter((s) => isSafeUrl(s.url)).map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-signal underline underline-offset-4 hover:text-paper"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          <div className="mt-10 border-t border-ink-line pt-6">
            <ShareActions slug={article.slug} title={article.title} path={path} />
          </div>

          <aside className="mt-10 border-2 border-signal p-6">
            <p className="kicker mb-2">The Shortlist</p>
            <p className="mb-4 text-sm text-paper-dim">
              Liked this? The newsletter is the shortlist — what we found, why it matters.
            </p>
            <NewsletterForm location={`story:${article.slug}`} compact />
          </aside>
        </div>

        {related.length > 0 ? (
          <section aria-label="Related stories" className="mx-auto mt-16 max-w-4xl border-t-2 border-paper pt-8">
            <h2 className="headline mb-6 text-2xl">Related</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {related.map((a) => (
                <StoryCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        ) : null}

        {nextStory && nextStory.slug !== article.slug ? (
          <section aria-label="Next story" className="mx-auto mt-12 max-w-4xl">
            <Link
              href={`/stories/${nextStory.slug}`}
              className="group flex items-center justify-between gap-4 border border-ink-line p-6 transition-colors hover:border-signal"
            >
              <div>
                <p className="kicker">Up next</p>
                <p className="headline mt-2 text-xl group-hover:text-signal sm:text-2xl">{nextStory.title}</p>
              </div>
              <span className="font-display text-3xl text-signal" aria-hidden>
                →
              </span>
            </Link>
          </section>
        ) : null}
      </Container>
    </article>
  );
}
