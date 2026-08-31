import type { Article } from "@/lib/types";
import { StoryCard } from "./StoryCard";

export function ArticleGrid({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <div className="border border-ink-line p-10 text-center">
        <p className="headline text-xl">More coming soon.</p>
        <p className="mt-2 text-sm text-paper-dim">
          This desk is warming up. New stories land here as they publish.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, i) => (
        <StoryCard key={article.slug} article={article} variant={i === 0 ? "lead" : "standard"} />
      ))}
    </div>
  );
}
