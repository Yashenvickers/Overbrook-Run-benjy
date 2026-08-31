"use client";

import { useId, useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterForm({
  location,
  compact = false,
}: {
  location: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const inputId = useId();
  const messageId = useId();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          location,
          consentAt: new Date().toISOString(),
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      setStatus("success");
      setMessage(data.message || "You're on the list. Welcome to the shortlist.");
      track("newsletter_signup", { location });
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="border-2 border-signal bg-ink-soft px-4 py-3 text-sm text-paper">
        ✓ {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor={inputId} className={cn("mb-2 block text-sm font-bold", compact && "sr-only")}>
        Email address
      </label>
      <div className={cn("flex gap-2", compact ? "flex-row" : "flex-col sm:flex-row")}>
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-describedby={message ? messageId : undefined}
          aria-invalid={status === "error" || undefined}
          className="min-h-12 w-full min-w-0 border-2 border-ink-line bg-ink px-3 text-paper placeholder:text-paper-dim/60 focus:border-signal focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-12 shrink-0 bg-signal px-5 text-sm font-bold uppercase tracking-wider text-signal-ink transition-colors hover:bg-paper disabled:opacity-60"
        >
          {status === "loading" ? "Joining…" : "Join"}
        </button>
      </div>
      {message && status === "error" ? (
        <p id={messageId} role="alert" className="mt-2 text-sm text-live">
          {message}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-paper-dim">
        No spam, unsubscribe anytime. See our{" "}
        <a href="/privacy" className="underline hover:text-signal">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
