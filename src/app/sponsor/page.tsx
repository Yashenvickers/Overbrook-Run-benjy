import type { Metadata } from "next";
import { LeadForm } from "@/components/forms/LeadForm";
import { sponsorFields, StandardTermsNote } from "@/components/forms/leadFieldSpecs";
import { FormPageShell } from "@/components/forms/FormPageShell";

export const metadata: Metadata = {
  title: "Sponsor Preee TV",
  description:
    "Partner with the platform culture actually watches — series, segments, events, and newsletter sponsorships.",
  alternates: { canonical: "/sponsor" },
};

export default function SponsorPage() {
  return (
    <FormPageShell
      kicker="Brands"
      title="Sponsor Preee TV"
      intro="Back the platform culture actually watches. Sponsorships run across series, segments, events, and the newsletter — always disclosed, always built to fit the world they appear in."
      aside={
        <div className="space-y-4 border border-ink-line p-6 text-sm text-paper-dim">
          <p className="kicker">Why brands work with Preee</p>
          <p>An audience that shows up for discovery, not just headlines.</p>
          <p>Cinematic formats your brand actually looks good inside.</p>
          <p>Full transparency: every placement is disclosed to the audience.</p>
        </div>
      }
    >
      <LeadForm
        type="sponsor"
        fields={sponsorFields}
        submitLabel="Start the conversation"
        successTitle="Thanks — we're on it."
        successBody="Our partnerships desk will reach out with formats, audience details, and next steps."
        termsNote={<StandardTermsNote />}
      />
    </FormPageShell>
  );
}
