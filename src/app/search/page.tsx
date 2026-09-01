import type { Metadata } from "next";
import Link from "next/link";
import { searchContent } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { SearchTracker } from "@/components/search/SearchTracker";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  description: "Search stories, episodes, events, and artists on Preee TV.",
  alternates: { canonical: "/search" },
  robots: { index: false },
};

const TYPE_LABELS = {
  article: "Story",
  episode: "Watch",
  event: "Event",
  artist: "Artist",
} as const;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? await searchContent(q) : [];

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="headline text-4xl sm:text-5xl">Search</h1>
      </header>

      <form action="/search" method="get" role="search" className="mb-10 flex max-w-xl gap-2">
        <label htmlFor="search-input" className="sr-only">
          Search Preee TV
        </label>
        <input
          id="search-input"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Artists, stories, episodes, events…"
          autoFocus={!q}
          className="min-h-12 w-full border-2 border-ink-line bg-ink px-4 text-paper placeholder:text-paper-dim/60 focus:border-signal focus:outline-none"
        />
        <button
          type="submit"
          className="min-h-12 shrink-0 bg-signal px-5 text-sm font-bold uppercase tracking-wider text-signal-ink hover:bg-paper"
        >
          Search
        </button>
      </form>

      {q ? (
        <>
          <SearchTracker query={q} results={results.length} />
          <p className="mb-6 text-sm text-paper-dim" role="status">
            {results.length} result{results.length === 1 ? "" : "s"} for{" "}
            <span className="font-bold text-paper">“{q}”</span>
          </p>
          {results.length > 0 ? (
            <ol className="divide-y divide-ink-line border-t border-ink-line">
              {results.map((r) => (
                <li key={`${r.type}-${r.href}`} className="py-4">
                  <p className="kicker">{TYPE_LABELS[r.type]}</p>
                  <p className="mt-1 text-lg font-bold">
                    <Link href={r.href} className="hover:text-signal">
                      {r.title}
                    </Link>
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-paper-dim">{r.description}</p>
                  {r.date ? (
                    <p className="mt-1 text-xs text-paper-dim">{formatDate(r.date)}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <div className="border border-ink-line p-10 text-center">
              <p className="headline text-xl">Nothing yet.</p>
              <p className="mt-2 text-sm text-paper-dim">
                Try a different term — or tell us what we're missing via the contact page.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-paper-dim">
          Search across stories, episodes, calendar events, and artist spotlights.
        </p>
      )}
    </Container>
  );
}
