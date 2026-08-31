import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";
import { BRAND_NAME, CONTACT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms that govern your use of ${BRAND_NAME}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Use" updated="August 2026">
      <p>
        By using {BRAND_NAME}, you agree to these terms. If you do not agree, please do not use the
        site.
      </p>
      <h2>Content</h2>
      <p>
        Everything published on {BRAND_NAME} — text, graphics, video presentation, and design — is
        owned by {BRAND_NAME} or used with permission, and is protected by copyright and other
        laws. You may share links to our content freely; you may not republish substantial portions
        without permission. Embedded third-party media (such as YouTube videos) remains subject to
        the source platform&apos;s terms.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Don&apos;t misuse the site: no scraping at scale, no attempting to breach security, no
        submitting content you don&apos;t have the rights to share, and no using our forms to send
        spam or unlawful material.
      </p>
      <h2>Editorial independence</h2>
      <p>
        Editorial coverage is never sold. Sponsored or promotional content is always labeled.
        Opinions expressed in stories and episodes are those of {BRAND_NAME} or the speakers, not
        of sponsors.
      </p>
      <h2>No warranties; limitation of liability</h2>
      <p>
        The site is provided &quot;as is.&quot; To the fullest extent permitted by law,{" "}
        {BRAND_NAME} disclaims warranties and will not be liable for indirect or consequential
        damages arising from use of the site. Event information is provided for planning purposes
        and may change; always confirm with the official source linked on the event.
      </p>
      <h2>Changes</h2>
      <p>
        We may update these terms; the date above reflects the latest revision. Continued use after
        changes means you accept the updated terms.
      </p>
      <p>
        Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <p>
        <em>
          This document is a launch template and should be reviewed by legal counsel before
          production use.
        </em>
      </p>
    </LegalShell>
  );
}
