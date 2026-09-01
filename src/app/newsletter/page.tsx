import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { BRAND_HOOK } from "@/config/site";

export const metadata: Metadata = {
  title: "Newsletter — The Shortlist",
  description:
    "One email. The records, moments, and moves worth your attention — before the feed decides for you.",
  alternates: { canonical: "/newsletter" },
};

export default function NewsletterPage() {
  return (
    <Container className="py-14">
      <div className="mx-auto max-w-2xl">
        <p className="kicker mb-3">The Shortlist</p>
        <h1 className="headline text-4xl text-signal sm:text-5xl">{BRAND_HOOK}</h1>
        <p className="mt-5 text-lg text-paper-dim">
          One email. What we found, why it matters, no filler. New music worth a first listen,
          the culture moments with staying power, and the business moves that change who gets paid.
        </p>
        <div className="mt-8 max-w-md">
          <NewsletterForm location="newsletter-page" />
        </div>
        <ul className="mt-10 space-y-3 border-t border-ink-line pt-6 text-sm text-paper-dim">
          <li>• The records we co-signed this week — and why.</li>
          <li>• What's coming on the Culture Calendar before it sells out.</li>
          <li>• One thing from The Business that actually affects your money.</li>
        </ul>
      </div>
    </Container>
  );
}
