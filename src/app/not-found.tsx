import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="kicker mb-4">404</p>
      <h1 className="headline text-4xl sm:text-6xl">
        You don&apos;t know about it
        <br />
        <span className="text-signal">because it doesn&apos;t exist.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-paper-dim">
        This page moved, dropped, or never was. The good stuff is still here.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back to the homepage</ButtonLink>
        <ButtonLink href="/latest" variant="secondary">
          The Latest
        </ButtonLink>
      </div>
      <p className="mt-8 text-sm text-paper-dim">
        Looking for something specific?{" "}
        <Link href="/search" className="text-signal underline underline-offset-4">
          Search the site
        </Link>
        .
      </p>
    </Container>
  );
}
