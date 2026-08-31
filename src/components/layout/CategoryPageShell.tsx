import type { Article } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { ArticleGrid } from "@/components/cards/ArticleGrid";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_URL, BRAND_NAME } from "@/config/site";

export function CategoryPageShell({
  title,
  description,
  articles,
  path,
}: {
  title: string;
  description: string;
  articles: Article[];
  path: string;
}) {
  return (
    <Container className="py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: BRAND_NAME, item: SITE_URL },
            { "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}${path}` },
          ],
        }}
      />
      <header className="mb-10 border-b-2 border-paper pb-6">
        <h1 className="headline text-4xl sm:text-6xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-paper-dim">{description}</p>
      </header>
      <ArticleGrid articles={articles} />
      <div className="mt-16 border-t border-ink-line pt-10">
        <p className="kicker mb-2">The Shortlist</p>
        <p className="mb-4 max-w-xl text-paper-dim">
          Get the best of {title} in one email. No filler.
        </p>
        <div className="max-w-md">
          <NewsletterForm location={`category:${path}`} compact />
        </div>
      </div>
    </Container>
  );
}
