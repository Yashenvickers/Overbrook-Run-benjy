import type { Metadata } from "next";
import { LeadForm } from "@/components/forms/LeadForm";
import { requestInterviewFields, StandardTermsNote } from "@/components/forms/leadFieldSpecs";
import { FormPageShell } from "@/components/forms/FormPageShell";

export const metadata: Metadata = {
  title: "Request an Interview",
  description:
    "Pitch an artist or guest for a researched, long-form Preee TV conversation.",
  alternates: { canonical: "/request-interview" },
};

export default function RequestInterviewPage() {
  return (
    <FormPageShell
      kicker="Talent & PR"
      title="Request an Interview"
      intro="The Preee TV interview is researched, long-form, and built for rewatching. Pitch us the conversation — not the press release."
      aside={
        <div className="space-y-4 border border-ink-line p-6 text-sm text-paper-dim">
          <p className="kicker">What makes a strong pitch</p>
          <p>A reason this conversation matters now — a record, a run, a turning point.</p>
          <p>Enough links for us to do real homework before anyone sits down.</p>
          <p>The question you wish someone would finally ask.</p>
        </div>
      }
    >
      <LeadForm
        type="request_interview"
        fields={requestInterviewFields}
        submitLabel="Send interview request"
        successTitle="Request received."
        successBody="We review every pitch against the upcoming schedule. If there's a fit, we'll reach out to coordinate."
        termsNote={<StandardTermsNote />}
      />
    </FormPageShell>
  );
}
