import "server-only";
import { Resend } from "resend";
import { BRAND_NAME } from "@/config/site";

let cached: Resend | null | undefined;

function getResend(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  cached = key ? new Resend(key) : null;
  return cached;
}

const FROM =
  process.env.LEADS_FROM_EMAIL || `${BRAND_NAME} <onboarding@resend.dev>`;

/** Internal notification to the editorial/partnerships desk. Best-effort. */
export async function sendInternalNotification(subject: string, text: string): Promise<void> {
  const resend = getResend();
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!resend || !to) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, text });
  } catch (err) {
    console.error("Internal notification failed:", err);
  }
}

/** Confirmation email to the person who submitted. Best-effort. */
export async function sendConfirmation(to: string, subject: string, text: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({ from: FROM, to, subject, text });
  } catch (err) {
    console.error("Confirmation email failed:", err);
  }
}
