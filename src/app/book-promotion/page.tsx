import type { Metadata } from "next";
import { LeadForm } from "@/components/forms/LeadForm";
import { bookPromotionFields, StandardTermsNote } from "@/components/forms/leadFieldSpecs";
import { FormPageShell } from "@/components/forms/FormPageShell";

export const metadata: Metadata = {
  title: "Book Promotion",
  description:
    "Run a clearly labeled promotional campaign across Preee TV inventory — singles, albums, videos, events, and tours.",
  alternates: { canonical: "/book-promotion" },
};

export default function BookPromotionPage() {
  return (
    <FormPageShell
      kicker="Campaigns"
      title="Book Promotion"
      intro="Promotion on Preee TV is honest by design: labeled clearly, built to look great, and never disguised as editorial. Tell us about the campaign and we'll come back with options."
      aside={
        <div className="space-y-4 border border-ink-line p-6 text-sm text-paper-dim">
          <p className="kicker">The one rule</p>
          <p>
            Editorial coverage is never for sale. Promotion is always labeled as promotion. That
            split is what keeps both worth something.
          </p>
          <p className="border-t border-ink-line pt-4">
            Not sure which you need? Start with a{" "}
            <a href="/submit-music" className="text-signal underline">
              music submission
            </a>{" "}
            — it's free.
          </p>
        </div>
      }
    >
      <LeadForm
        type="book_promotion"
        fields={bookPromotionFields}
        submitLabel="Send promotion inquiry"
        successTitle="Inquiry received."
        successBody="We'll review the campaign details and reply with available inventory, formats, and pricing."
        termsNote={<StandardTermsNote />}
      />
    </FormPageShell>
  );
}
