import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";
import { BRAND_NAME, CONTACT_EMAIL } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${BRAND_NAME} collects, uses, and protects your information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="August 2026">
      <p>
        This policy explains what {BRAND_NAME} (&quot;we&quot;) collects when you use this site,
        why we collect it, and the choices you have. It is written to be read, not to hide things.
      </p>
      <h2>What we collect</h2>
      <p>
        <strong>Forms you choose to fill in.</strong> Music submissions, interview requests,
        promotion and sponsorship inquiries, and newsletter signups collect the information shown
        on each form — typically your name, email, links you provide, and your message — together
        with the time you consented, the page you came from, and campaign (UTM) parameters if your
        link contained them.
      </p>
      <p>
        <strong>Basic usage analytics.</strong> When analytics are enabled, we measure page views
        and product events (such as a video being played or a search being run) to understand what
        content works. We do not sell personal information.
      </p>
      <h2>How we use it</h2>
      <p>
        To review submissions and respond to inquiries, to send the newsletter you asked for, to
        keep the site secure (including spam and bot filtering), and to improve the product. Form
        submissions are stored in our database and may generate an internal notification email to
        our team and a confirmation email to you.
      </p>
      <h2>Third-party services</h2>
      <p>
        The site may use Supabase (data storage), Resend (email delivery), Cloudflare Turnstile
        (bot protection), Vercel (hosting and analytics), Google Analytics (optional, only if
        enabled), and YouTube (embedded video — YouTube sets its own cookies only after you press
        play). Each processes data under its own privacy policy.
      </p>
      <h2>Your choices</h2>
      <p>
        Every newsletter email includes an unsubscribe link. You can ask us to access, correct, or
        delete information you have submitted by emailing{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We keep submissions only as long
        as needed for the purpose you sent them.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
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
