import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";
import { BRAND_NAME, CONTACT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Submission Terms",
  description: `What you agree to when you submit music, pitches, or inquiries to ${BRAND_NAME}.`,
  alternates: { canonical: "/submission-terms" },
};

export default function SubmissionTermsPage() {
  return (
    <LegalShell title="Submission Terms" updated="August 2026">
      <p>
        These terms apply to anything you send {BRAND_NAME} through our forms — music submissions,
        interview requests, promotion inquiries, and sponsorship inquiries.
      </p>
      <h2>You keep your rights</h2>
      <p>
        Submitting music or materials does not transfer ownership. You keep all rights to your
        work. You grant {BRAND_NAME} permission to access, stream, and internally share the links
        you provide for review purposes.
      </p>
      <h2>You must have the rights to what you send</h2>
      <p>
        By submitting, you confirm the material is yours or that you are authorized to submit it on
        the rights holder&apos;s behalf, and that nothing in it infringes anyone else&apos;s
        rights.
      </p>
      <h2>No guarantee of coverage — and no fee for consideration</h2>
      <p>
        Submission does not guarantee coverage, response, or timing. Editorial coverage cannot be
        bought; consideration is always free. If we feature your work editorially, we will
        credit you and link to your official channels. Paid, clearly-labeled promotion is a
        separate service arranged through the Book Promotion flow.
      </p>
      <h2>If we feature you</h2>
      <p>
        Where coverage or a session involves assets you provide (photos, video, audio), we will use
        them only as agreed with you, with credit, and we track the rights status of every asset we
        publish.
      </p>
      <h2>Data</h2>
      <p>
        The information you submit is handled per our{" "}
        <a href="/privacy">Privacy Policy</a>.
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
