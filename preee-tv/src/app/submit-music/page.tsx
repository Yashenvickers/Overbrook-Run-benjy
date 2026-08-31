import type { Metadata } from "next";
import { LeadForm } from "@/components/forms/LeadForm";
import { submitMusicFields, StandardTermsNote } from "@/components/forms/leadFieldSpecs";
import { FormPageShell } from "@/components/forms/FormPageShell";

export const metadata: Metadata = {
  title: "Submit Music",
  description:
    "Put your record on the Preee TV desk. A real human listens to everything — links only, no uploads.",
  alternates: { canonical: "/submit-music" },
};

export default function SubmitMusicPage() {
  return (
    <FormPageShell
      kicker="Artists"
      title="Submit Music"
      intro="A real human listens to everything that comes through this form. Send links, not files — and tell us the story, because the story is half the record."
      aside={
        <div className="space-y-4 border border-ink-line p-6 text-sm text-paper-dim">
          <p className="kicker">How this works</p>
          <p>1. You submit links and the story behind the record.</p>
          <p>2. The desk listens. Everything gets played — no bots, no auto-replies pretending to be people.</p>
          <p>3. If it's a fit for coverage, a spotlight, or a session, we reach out directly.</p>
          <p className="border-t border-ink-line pt-4">
            Coverage is never sold. If you're looking for labeled promotion instead, use{" "}
            <a href="/book-promotion" className="text-signal underline">
              Book Promotion
            </a>
            .
          </p>
        </div>
      }
    >
      <LeadForm
        type="submit_music"
        fields={submitMusicFields}
        submitLabel="Submit your music"
        successTitle="Received. A human will listen."
        successBody="Your submission is on the desk. If it's a fit, we'll reach out at the email you provided — no need to follow up before two weeks."
        termsNote={<StandardTermsNote />}
      />
    </FormPageShell>
  );
}
