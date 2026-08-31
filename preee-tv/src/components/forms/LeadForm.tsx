"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  bookPromotionSchema,
  captureAttribution,
  requestInterviewSchema,
  sponsorSchema,
  submitMusicSchema,
  type LeadType,
} from "@/lib/leads";
import { track } from "@/lib/analytics";
import { Turnstile } from "./Turnstile";
import { cn } from "@/lib/utils";

export interface FieldSpec {
  name: string;
  label: string;
  kind: "text" | "email" | "tel" | "url" | "textarea" | "select" | "checkboxGroup";
  required?: boolean;
  placeholder?: string;
  help?: string;
  autoComplete?: string;
  options?: { value: string; label: string }[];
}

const SCHEMAS: Record<LeadType, z.ZodTypeAny> = {
  submit_music: submitMusicSchema,
  request_interview: requestInterviewSchema,
  book_promotion: bookPromotionSchema,
  sponsor: sponsorSchema,
};

const COMPLETE_EVENTS: Record<
  LeadType,
  "submit_music_complete" | "interview_request_complete" | "promotion_inquiry_complete" | "sponsor_inquiry_complete"
> = {
  submit_music: "submit_music_complete",
  request_interview: "interview_request_complete",
  book_promotion: "promotion_inquiry_complete",
  sponsor: "sponsor_inquiry_complete",
};

type FormValues = Record<string, unknown>;

export function LeadForm({
  type,
  fields,
  submitLabel,
  successTitle,
  successBody,
  termsNote,
}: {
  type: LeadType;
  fields: FieldSpec[];
  submitLabel: string;
  successTitle: string;
  successBody: string;
  termsNote: React.ReactNode;
}) {
  const formId = useId();
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState<null | { demo: boolean }>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const startedRef = useRef(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(SCHEMAS[type] as any) as never,
    mode: "onTouched",
    defaultValues: { type, agreeTerms: false },
  });

  // Fire *_start once, on first interaction with the submit-music flow.
  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    if (type === "submit_music") track("submit_music_start", {});
  }

  const errorList = Object.entries(errors as FieldErrors).filter(([key]) =>
    fields.some((f) => f.name === key) || key === "agreeTerms",
  );

  // Focus the error summary only after a failed submit attempt — never while
  // the user is still typing or tabbing through fields.
  useEffect(() => {
    if (submitCount > 0 && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount]);

  async function onSubmit(values: FormValues) {
    setServerError("");
    const attribution = captureAttribution();
    const payload = {
      ...values,
      ...attribution,
      type,
      consentAt: new Date().toISOString(),
      turnstileToken,
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; demo?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
      setSubmitted({ demo: Boolean(data.demo) });
      track(COMPLETE_EVENTS[type], {});
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div role="status" className="border-2 border-signal bg-ink-soft p-8">
        <p className="headline text-2xl text-signal">✓ {successTitle}</p>
        <p className="mt-3 text-paper-dim">{successBody}</p>
        {submitted.demo ? (
          <p className="mt-4 border border-ink-line p-3 text-xs text-paper-dim">
            Demo mode: this environment has no form backend configured, so nothing was stored. Your
            input validated successfully and the flow works end to end.
          </p>
        ) : null}
      </div>
    );
  }

  const fieldError = (name: string): string | undefined => {
    const err = (errors as FieldErrors)[name];
    return typeof err?.message === "string" ? err.message : undefined;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate onChange={markStarted}>
      {/* Accessible error summary for long forms */}
      {errorList.length > 0 ? (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-label="Form errors"
          className="mb-6 border-2 border-live bg-ink-soft p-4"
        >
          <p className="font-bold text-live">Please fix the following:</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {errorList.map(([name, err]) => (
              <li key={name}>
                <a href={`#${formId}-${name}`} className="underline hover:text-signal">
                  {typeof err?.message === "string" ? err.message : "Check this field."}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-6">
        {fields.map((field) => {
          const id = `${formId}-${field.name}`;
          const error = fieldError(field.name);
          const describedBy =
            [error ? `${id}-error` : null, field.help ? `${id}-help` : null]
              .filter(Boolean)
              .join(" ") || undefined;
          const baseInput =
            "min-h-12 w-full border-2 bg-ink px-3 py-3 text-paper placeholder:text-paper-dim/50 focus:outline-none " +
            (error ? "border-live" : "border-ink-line focus:border-signal");

          return (
            <div key={field.name}>
              <label htmlFor={id} className="mb-1 block text-sm font-bold">
                {field.label}
                {field.required ? (
                  <span className="text-signal" aria-hidden>
                    {" "}
                    *
                  </span>
                ) : (
                  <span className="ml-2 text-xs font-normal text-paper-dim">(optional)</span>
                )}
              </label>
              {field.help ? (
                <p id={`${id}-help`} className="mb-2 text-xs text-paper-dim">
                  {field.help}
                </p>
              ) : null}

              {field.kind === "textarea" ? (
                <textarea
                  id={id}
                  rows={5}
                  placeholder={field.placeholder}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  className={baseInput}
                  {...register(field.name)}
                />
              ) : field.kind === "select" ? (
                <select
                  id={id}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  className={baseInput}
                  defaultValue=""
                  {...register(field.name)}
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {(field.options ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : field.kind === "checkboxGroup" ? (
                <fieldset
                  id={id}
                  aria-describedby={describedBy}
                  className={cn("border-2 p-4", error ? "border-live" : "border-ink-line")}
                >
                  <legend className="sr-only">{field.label}</legend>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(field.options ?? []).map((o) => (
                      <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          value={o.value}
                          className="h-5 w-5 accent-[#F5E003]"
                          {...register(field.name)}
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <input
                  id={id}
                  type={field.kind}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  className={baseInput}
                  {...register(field.name)}
                />
              )}

              {error ? (
                <p id={`${id}-error`} className="mt-1 text-sm text-live">
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}

        {/* Honeypot — visually hidden, ignored by humans, filled by bots. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor={`${formId}-website`}>Leave this field empty</label>
          <input
            id={`${formId}-website`}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>

        {/* Consent */}
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#F5E003]"
              aria-invalid={fieldError("agreeTerms") ? true : undefined}
              {...register("agreeTerms")}
            />
            <span>{termsNote}</span>
          </label>
          {fieldError("agreeTerms") ? (
            <p className="mt-1 text-sm text-live">{fieldError("agreeTerms")}</p>
          ) : null}
        </div>

        <Turnstile onToken={setTurnstileToken} />

        {serverError ? (
          <p role="alert" className="border-2 border-live p-3 text-sm text-live">
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-12 w-full bg-signal px-6 font-bold uppercase tracking-wider text-signal-ink transition-colors hover:bg-paper disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? "Sending…" : submitLabel}
        </button>
        <p className="text-xs text-paper-dim">
          We only use what you send here to respond to this request. See the{" "}
          <a href="/privacy" className="underline hover:text-signal">
            privacy policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}
