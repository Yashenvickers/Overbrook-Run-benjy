"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in monitoring; never expose internals to the reader.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-site px-4 py-24 text-center sm:px-6">
      <p className="kicker mb-4">Something broke</p>
      <h1 className="headline text-4xl sm:text-5xl">
        The feed skipped.
        <br />
        <span className="text-signal">Let&apos;s run it back.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-paper-dim">
        An unexpected error interrupted this page. Trying again usually fixes it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center bg-signal px-5 text-sm font-bold uppercase tracking-wider text-signal-ink hover:bg-paper"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center border-2 border-paper px-5 text-sm font-bold uppercase tracking-wider text-paper hover:border-signal hover:text-signal"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
