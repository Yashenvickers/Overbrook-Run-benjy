import type { Metadata } from "next";
import Image from "next/image";
import { getArtists } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { BRAND_EDITORIAL_LINE, BRAND_HOOK, BRAND_NAME, BRAND_TAGLINE } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `${BRAND_NAME}: ${BRAND_TAGLINE}`,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const artists = await getArtists();
  const spotlight = artists.find((a) => a.spotlight) ?? artists[0];

  return (
    <Container className="py-10">
      <header className="mb-12 border-b-2 border-paper pb-8">
        <p className="kicker mb-3">About {BRAND_NAME}</p>
        <h1 className="headline max-w-4xl text-4xl text-signal sm:text-6xl">{BRAND_HOOK}</h1>
        <p className="mt-4 max-w-2xl text-lg text-paper-dim">{BRAND_TAGLINE}</p>
      </header>

      <div className="prose-dark max-w-prose">
        <p>
          {BRAND_NAME} is a culture-first media platform: {BRAND_EDITORIAL_LINE.toLowerCase()} We
          cover the music before the charts notice it, the culture that gives it meaning, and the
          business that decides who gets paid for it.
        </p>
        <h2>What we make</h2>
        <p>
          Long-form interviews that get researched, not scheduled. One-take performance sessions
          shot to be rewatched. Scene reports from the cities minting new sounds. A Culture
          Calendar that treats releases, festivals, and award shows as one map. And The Business —
          plain-language coverage of streaming economics, deals, and touring math.
        </p>
        <h2>What we don't do</h2>
        <p>
          We don't sell coverage. When something is sponsored, it says so at the top. When we get
          something wrong, the correction is public. And when we co-sign an artist, we expect to be
          held accountable for it.
        </p>
      </div>

      {spotlight ? (
        <section id="spotlight" aria-label="Artist spotlight" className="mt-16 border-y-2 border-signal py-10">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
            <div className="relative aspect-square w-full max-w-xs overflow-hidden bg-ink-soft">
              <Image
                src={spotlight.image.src}
                alt={spotlight.image.alt}
                fill
                sizes="20rem"
                className="object-cover"
              />
            </div>
            <div className="md:col-span-2">
              <p className="kicker mb-2">Artist Spotlight</p>
              <h2 className="headline text-3xl">{spotlight.name}</h2>
              <p className="mt-3 max-w-prose text-paper-dim">{spotlight.oneLiner}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <h2 className="headline mb-3 text-2xl">Work with us</h2>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/submit-music">Submit music</ButtonLink>
            <ButtonLink href="/request-interview" variant="secondary">
              Request an interview
            </ButtonLink>
            <ButtonLink href="/sponsor" variant="secondary">
              Sponsor
            </ButtonLink>
          </div>
        </div>
        <div>
          <h2 className="headline mb-3 text-2xl">Get the Shortlist</h2>
          <NewsletterForm location="about" compact />
        </div>
      </section>
    </Container>
  );
}
