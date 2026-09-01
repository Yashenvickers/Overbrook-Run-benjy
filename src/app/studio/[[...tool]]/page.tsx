import type { Metadata } from "next";
import { sanityConfigured } from "@/lib/sanity/env";
import { StudioClient } from "./StudioClient";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-24">
        <p className="kicker mb-3">Sanity Studio</p>
        <h1 className="headline text-3xl">Studio isn&apos;t configured yet.</h1>
        <div className="prose-dark mt-6">
          <p>
            The CMS mounts here once a Sanity project is connected. Until then the site runs
            entirely on bundled seed content.
          </p>
          <p>To connect:</p>
          <ol>
            <li>Create a project at sanity.io/manage.</li>
            <li>
              Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{" "}
              <code>NEXT_PUBLIC_SANITY_DATASET</code> in your environment.
            </li>
            <li>Restart the app — the Studio appears at this route automatically.</li>
          </ol>
        </div>
      </div>
    );
  }
  return <StudioClient />;
}
