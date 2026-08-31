import Link from "next/link";
import {
  BRAND_EDITORIAL_LINE,
  BRAND_HOOK,
  BRAND_NAME,
  FOOTER_GROUPS,
} from "@/config/site";
import { SocialIcons } from "./SocialIcons";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function Footer() {
  return (
    <footer className="border-t-2 border-paper bg-ink" role="contentinfo">
      <div className="mx-auto w-full max-w-site px-4 py-12 sm:px-6 lg:px-8">
        <p className="headline mb-10 max-w-4xl text-2xl text-signal sm:text-4xl">
          {BRAND_HOOK}
        </p>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="kicker mb-4">{group.heading}</h2>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-sm text-paper-dim transition-colors hover:text-signal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2">
            <h2 className="kicker mb-4">The Shortlist</h2>
            <p className="mb-4 text-sm text-paper-dim">
              One email. What we found, why it matters, no filler.
            </p>
            <NewsletterForm location="footer" compact />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-ink-line pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg uppercase">
              Preee <span className="text-signal">TV</span>
            </p>
            <p className="mt-1 text-sm text-paper-dim">{BRAND_EDITORIAL_LINE}</p>
            <p className="mt-2 text-xs text-paper-dim">
              © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </p>
          </div>
          <SocialIcons />
        </div>
      </div>
    </footer>
  );
}
