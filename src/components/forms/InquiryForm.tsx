"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { site } from "@/content/site";
import { buttonClass } from "@/components/ui/Button";
import {
  AUDIENCES,
  AUDIENCE_LABELS,
  REASONS,
  REASON_LABELS,
  inquirySchema,
  toFieldErrors,
  type FieldErrors,
  type Inquiry,
} from "@/lib/validation/inquiry";

type Audience = (typeof AUDIENCES)[number];
type Reason = (typeof REASONS)[number];

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

type Props = {
  defaultAudience?: Audience;
  defaultReason?: Reason;
  /** Injected for tests; defaults to window.fetch. */
  fetchImpl?: typeof fetch;
};

const FIELD_ORDER: (keyof Inquiry)[] = ["audience", "reason", "name", "organization", "phone", "email", "preferredContact", "message", "consent"];

const LABELS: Partial<Record<keyof Inquiry, string>> = {
  audience: "I am a…",
  reason: "How can we help?",
  name: "Your name",
  organization: "Practice, school or organization",
  phone: "Phone",
  email: "Email",
  preferredContact: "Preferred contact",
  message: "Anything you’d like us to know",
  consent: "Confirmation",
};

export function InquiryForm({ defaultAudience = "family", defaultReason = "tour", fetchImpl }: Props) {
  const formId = useId();
  const [audience, setAudience] = useState<Audience>(defaultAudience);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [startedAt, setStartedAt] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Timestamp for the server-side minimum-fill-time bot check.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartedAt(Date.now());
  }, []);

  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
  }, [status.kind]);

  const needsOrg = audience === "physician" || audience === "school";
  const id = (name: string) => `${formId}-${name}`;
  const describedBy = (name: keyof Inquiry, hint?: boolean) =>
    [hint ? id(`${name}-hint`) : null, errors[name] ? id(`${name}-error`) : null].filter(Boolean).join(" ") || undefined;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      audience: String(data.get("audience") ?? ""),
      reason: String(data.get("reason") ?? ""),
      name: String(data.get("name") ?? ""),
      organization: String(data.get("organization") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      preferredContact: String(data.get("preferredContact") ?? "phone"),
      language: String(data.get("language") ?? "en"),
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
      website: String(data.get("website") ?? ""),
      startedAt,
    };

    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setStatus({ kind: "idle" });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setErrors({});
    setStatus({ kind: "submitting" });
    try {
      const res = await (fetchImpl ?? fetch)("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok: true; message: string }
        | { ok: false; error: string; fieldErrors?: FieldErrors }
        | null;

      if (res.ok && body?.ok) {
        setStatus({ kind: "success", message: body.message });
        form.reset();
        return;
      }
      if (body && !body.ok && body.fieldErrors) {
        setErrors(body.fieldErrors);
        requestAnimationFrame(() => summaryRef.current?.focus());
      }
      setStatus({
        kind: "error",
        message: body && !body.ok ? body.error : `Something went wrong. Please call ${site.phone.display}.`,
      });
    } catch {
      setStatus({ kind: "error", message: `We couldn’t reach our server. Please call ${site.phone.display}.` });
    }
  }

  if (status.kind === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="card p-8 text-center outline-none sm:p-12">
        <svg aria-hidden="true" viewBox="0 0 48 48" className="mx-auto h-16 w-16">
          <circle cx="24" cy="24" r="22" fill="#2f8f8a" opacity="0.15" />
          <path d="m15 24.5 6 6 12-13" fill="none" stroke="#1f6b67" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="mt-5 font-display text-3xl">Thank you.</h2>
        <p className="lede mx-auto mt-3 max-w-md">{status.message}</p>
        <p className="mt-6 text-sm text-muted">
          Need us sooner? Call{" "}
          <a className="font-semibold text-ink underline" href={site.phone.href}>
            {site.phone.display}
          </a>
          , {site.hours.display}
        </p>
        <button type="button" className={buttonClass("ghost", "md", "mt-8")} onClick={() => setStatus({ kind: "idle" })}>
          Send another message
        </button>
      </div>
    );
  }

  const errorKeys = FIELD_ORDER.filter((k) => errors[k]);
  const submitting = status.kind === "submitting";

  return (
    <form noValidate onSubmit={onSubmit} className="card space-y-6 p-6 sm:p-10" aria-describedby={id("phi")}>
      {errorKeys.length > 0 ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-2xl border-2 border-berry/60 bg-berry/5 p-5 outline-none">
          <h2 className="font-semibold text-berry-deep">Please fix the following:</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {errorKeys.map((k) => (
              <li key={k}>
                <a className="underline" href={`#${id(k)}`}>
                  {LABELS[k]}: {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div id={id("phi")} className="flex gap-3 rounded-2xl bg-sky/60 p-4 text-sm leading-relaxed text-ink">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-teal-deep">
          <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <p>
          <strong>Please don’t include medical details.</strong> This form is for contact information only — no child
          names, dates of birth, diagnoses or insurance numbers. We’ll collect those through a secure channel.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={LABELS.audience ?? ""} htmlFor={id("audience")} error={errors.audience} errorId={id("audience-error")} required>
          <select
            id={id("audience")}
            name="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
            aria-invalid={Boolean(errors.audience)}
            aria-describedby={describedBy("audience")}
            className={inputClass(errors.audience)}
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {AUDIENCE_LABELS[a]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={LABELS.reason ?? ""} htmlFor={id("reason")} error={errors.reason} errorId={id("reason-error")} required>
          <select
            id={id("reason")}
            name="reason"
            defaultValue={defaultReason}
            aria-invalid={Boolean(errors.reason)}
            aria-describedby={describedBy("reason")}
            className={inputClass(errors.reason)}
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {REASON_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={LABELS.name ?? ""} htmlFor={id("name")} error={errors.name} errorId={id("name-error")} required>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            className={inputClass(errors.name)}
          />
        </Field>
        {needsOrg ? (
          <Field label={LABELS.organization ?? ""} htmlFor={id("organization")} error={errors.organization} errorId={id("organization-error")} required>
            <input
              id={id("organization")}
              name="organization"
              autoComplete="organization"
              maxLength={150}
              aria-invalid={Boolean(errors.organization)}
              aria-describedby={describedBy("organization")}
              className={inputClass(errors.organization)}
            />
          </Field>
        ) : (
          <Field label="Preferred language" htmlFor={id("language")}>
            <select id={id("language")} name="language" defaultValue="en" className={inputClass()}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </Field>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={LABELS.phone ?? ""} htmlFor={id("phone")} error={errors.phone} errorId={id("phone-error")}>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={25}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone")}
            className={inputClass(errors.phone)}
          />
        </Field>
        <Field label={LABELS.email ?? ""} htmlFor={id("email")} error={errors.email} errorId={id("email-error")}>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={inputClass(errors.email)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">{LABELS.preferredContact}</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {(["phone", "email"] as const).map((m) => (
            <label key={m} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-cream px-4 has-[:checked]:border-teal has-[:checked]:bg-teal/10">
              <input type="radio" name="preferredContact" value={m} defaultChecked={m === "phone"} className="h-4 w-4 accent-teal" />
              <span className="text-sm font-semibold">{m === "phone" ? "By phone" : "By email"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label={LABELS.message ?? ""}
        htmlFor={id("message")}
        error={errors.message}
        errorId={id("message-error")}
        hint="Optional. General questions only — for example, best times to reach you."
        hintId={id("message-hint")}
      >
        <textarea
          id={id("message")}
          name="message"
          rows={4}
          maxLength={1000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message", true)}
          className={inputClass(errors.message)}
        />
      </Field>

      {/* Honeypot: hidden from people and assistive tech, attractive to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Leave this field empty</label>
        <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
          <input
            id={id("consent")}
            type="checkbox"
            name="consent"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? id("consent-error") : undefined}
            className="mt-1 h-5 w-5 shrink-0 accent-teal"
          />
          <span>
            I haven’t included my child’s name, date of birth, diagnosis or insurance details, and I agree that STARS
            may contact me about this request.
          </span>
        </label>
        {errors.consent ? (
          <p id={id("consent-error")} className="mt-2 text-sm font-semibold text-berry-deep">
            {errors.consent}
          </p>
        ) : null}
      </div>

      {status.kind === "error" ? (
        <p role="alert" className="rounded-2xl bg-berry/5 p-4 text-sm font-semibold text-berry-deep">
          {status.message}
        </p>
      ) : null}

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={submitting} aria-busy={submitting} className={buttonClass("primary", "lg")}>
          {submitting ? "Sending…" : "Send my request"}
        </button>
        <p className="text-sm text-muted">
          Prefer to talk?{" "}
          <a href={site.phone.href} className="font-semibold text-ink underline underline-offset-4">
            {site.phone.display}
          </a>
        </p>
      </div>
    </form>
  );
}

function inputClass(error?: string): string {
  return `mt-2 block min-h-12 w-full rounded-2xl border bg-cream px-4 py-3 text-base text-ink shadow-inner shadow-ink/5 transition-colors placeholder:text-muted focus:border-teal focus:bg-paper focus:outline-none focus-visible:outline-3 focus-visible:outline-teal ${
    error ? "border-berry" : "border-line"
  }`;
}

function Field({
  label,
  htmlFor,
  children,
  error,
  errorId,
  hint,
  hintId,
  required,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  error?: string;
  errorId?: string;
  hint?: string;
  hintId?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-berry">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} className="mt-2 text-sm font-semibold text-berry-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}
