import type { Metadata } from "next";
import { getEpisodes } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { EpisodeCard } from "@/components/cards/EpisodeCard";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Interviews, performances, and the conversations behind the headlines — Preee TV episodes.",
  alternates: { canonical: "/watch" },
};

export default async function WatchPage() {
  const episodes = await getEpisodes();
  return (
    <Container className="py-10">
      <header className="mb-10 border-b-2 border-paper pb-6">
        <p className="kicker mb-2">Press play</p>
        <h1 className="headline text-4xl sm:text-6xl">Watch Preee TV</h1>
        <p className="mt-3 max-w-2xl text-paper-dim">
          Long-form interviews, one-take performances, and the business conversations nobody else
          films. Shot to be rewatched.
        </p>
      </header>
      {episodes.length > 0 ? (
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.map((episode) => (
            <EpisodeCard key={episode.slug} episode={episode} />
          ))}
        </div>
      ) : (
        <div className="border border-ink-line p-10 text-center">
          <p className="headline text-xl">First episodes premiere soon.</p>
        </div>
      )}
      <div className="mt-16 border-t border-ink-line pt-10">
        <p className="kicker mb-2">Never miss a drop</p>
        <div className="max-w-md">
          <NewsletterForm location="watch-index" compact />
        </div>
      </div>
    </Container>
  );
}
