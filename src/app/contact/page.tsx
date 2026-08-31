import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CONTACT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Preee TV desk — editorial, corrections, partnerships, and everything else.",
  alternates: { canonical: "/contact" },
};

const ROUTES = [
  { label: "Submit music", href: "/submit-music", note: "Artists — put your record on the desk." },
  { label: "Request an interview", href: "/request-interview", note: "Talent, managers, PR." },
  { label: "Book promotion", href: "/book-promotion", note: "Labeled campaigns and premieres." },
  { label: "Sponsor Preee TV", href: "/sponsor", note: "Brand partnerships." },
];

export default function ContactPage() {
  return (
    <Container className="py-10">
      <header className="mb-10 border-b-2 border-paper pb-6">
        <h1 className="headline text-4xl sm:text-5xl">Contact</h1>
        <p className="mt-3 max-w-2xl text-paper-dim">
          The fastest route is the right form — each one lands on the desk that can actually say
          yes. For everything else, email works.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROUTES.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group border border-ink-line p-6 transition-colors hover:border-signal"
          >
            <p className="headline text-xl group-hover:text-signal">{r.label}</p>
            <p className="mt-2 text-sm text-paper-dim">{r.note}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 max-w-prose space-y-4 text-paper-dim">
        <p>
          <span className="font-bold text-paper">General & corrections:</span>{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-signal underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-sm">
          Spotted an error in a story? Tell us — corrections are published openly on the story
          itself.
        </p>
      </div>
    </Container>
  );
}
