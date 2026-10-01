"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { site } from "@/content/site";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { getContent } from "@/content";
import { buttonClass } from "@/components/ui/Button";
import {
  AUDIENCES,
  CHILD_AGES,
  CONTACT_METHODS,
  DOCTOR_ANSWERS,
  POSITIONS,
  REASONS,
  inquirySchema,
  toFieldErrors,
  type Audience,
  type FieldErrors,
  type Inquiry,
  type Reason,
} from "@/lib/validation/inquiry";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export type InquiryFormProps = {
  /** Language of the page; drives every label, message and the server reply. */
  locale?: Locale;
  defaultAudience?: Audience;
  defaultReason?: Reason;
  /** Preselected role for job applications. */
  defaultPosition?: (typeof POSITIONS)[number];
  /** Audiences offered. A single entry hides the "I am a…" question. */
  audiences?: readonly Audience[];
  /** Reasons offered. A single entry hides the "How can we help?" question. */
  reasons?: readonly Reason[];
  submitLabel?: string;
  /** Extra guidance shown on the success screen. */
  successNote?: ReactNode;
  /** Hint under the message field. */
  messageHint?: string;
  /** Injected for tests; defaults to window.fetch. */
  fetchImpl?: typeof fetch;
};

const FIELD_ORDER: (keyof Inquiry)[] = [
  "audience",
  "reason",
  "name",
  "organization",
  "position",
  "startDate",
  "childAge",
  "phone",
  "email",
  "preferredContact",
  "message",
  "consent",
];


const str = (data: FormData, key: string, fallback = "") => {
  const v = data.get(key);
  return typeof v === "string" ? v : fallback;
};

export function InquiryForm({
  defaultAudience,
  defaultReason,
  defaultPosition,
  audiences = AUDIENCES,
  reasons = REASONS,
  submitLabel,
  successNote,
  messageHint,
  fetchImpl,
  locale = "en",
}: InquiryFormProps) {
  const d = getDictionary(locale).form;
  const hoursDisplay = getContent(locale).site.hours.display;
  const LABELS: Partial<Record<keyof Inquiry, string>> = d.labels;
  const formId = useId();
  const [audience, setAudience] = useState<Audience>(
    defaultAudience && audiences.includes(defaultAudience) ? defaultAudience : (audiences[0] ?? "family"),
  );
  const [reason, setReason] = useState<Reason>(
    defaultReason && reasons.includes(defaultReason) ? defaultReason : (reasons[0] ?? "tour"),
  );
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
  const isEnrollment = audience === "family" && (reason === "eligibility" || reason === "tour");
  const isJob = reason === "careers" && audience === "job-seeker";
  const id = (name: string) => `${formId}-${name}`;
  const describedBy = (name: keyof Inquiry, hint?: boolean) =>
    [hint ? id(`${name}-hint`) : null, errors[name] ? id(`${name}-error`) : null].filter(Boolean).join(" ") || undefined;
  const fieldProps = (name: keyof Inquiry, hint?: boolean) => ({
    id: id(name),
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": describedBy(name, hint),
    className: inputClass(errors[name]),
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      audience,
      reason,
      name: str(data, "name"),
      organization: str(data, "organization"),
      phone: str(data, "phone"),
      email: str(data, "email"),
      preferredContact: str(data, "preferredContact", "phone"),
      language: str(data, "language", locale),
      locale,
      childAge: str(data, "childAge"),
      hasPrimaryDoctor: str(data, "hasPrimaryDoctor"),
      position: str(data, "position"),
      startDate: str(data, "startDate"),
      message: str(data, "message"),
      consent: data.get("consent") === "on",
      website: str(data, "website"),
      startedAt,
    };

    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error, locale));
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
        message: body && !body.ok ? body.error : `${d.genericError} ${site.phone.display}.`,
      });
    } catch {
      setStatus({ kind: "error", message: `${d.networkError} ${site.phone.display}.` });
    }
  }

  if (status.kind === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="card p-8 text-center outline-none sm:p-12">
        <svg aria-hidden="true" viewBox="0 0 48 48" className="mx-auto h-16 w-16">
          <circle cx="24" cy="24" r="22" fill="#2f8f8a" opacity="0.15" />
          <path d="m15 24.5 6 6 12-13" fill="none" stroke="#1f6b67" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="mt-5 font-display text-3xl">{d.successTitle}</h2>
        <p className="lede mx-auto mt-3 max-w-md">{status.message}</p>
        {successNote ? <div className="mx-auto mt-5 max-w-md text-ink-soft">{successNote}</div> : null}
        <p className="mt-6 text-sm text-muted">
          {d.needSooner}{" "}
          <a className="font-semibold text-ink underline" href={site.phone.href}>
            {site.phone.display}
          </a>
          , {hoursDisplay}
        </p>
        <button type="button" className={buttonClass("ghost", "md", "mt-8")} onClick={() => setStatus({ kind: "idle" })}>
          {d.sendAnother}
        </button>
      </div>
    );
  }

  const errorKeys = FIELD_ORDER.filter((k) => errors[k]);
  const submitting = status.kind === "submitting";
  const showAudience = audiences.length > 1;
  const showReason = reasons.length > 1;

  return (
    <form noValidate onSubmit={onSubmit} className="card relative space-y-6 p-6 sm:p-10" aria-describedby={id("phi")}>
      {errorKeys.length > 0 ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-2xl border-2 border-berry/60 bg-berry/5 p-5 outline-none">
          <h2 className="font-semibold text-berry-deep">{d.fixTitle}</h2>
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
          <strong>{d.phiTitle}</strong> {d.phiBody}
        </p>
      </div>

      {showAudience || showReason ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {showAudience ? (
            <Field label={LABELS.audience ?? ""} htmlFor={id("audience")} error={errors.audience} errorId={id("audience-error")} required>
              <select {...fieldProps("audience")} value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>
                {audiences.map((a) => (
                  <option key={a} value={a}>
                    {d.audience[a]}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          {showReason ? (
            <Field label={LABELS.reason ?? ""} htmlFor={id("reason")} error={errors.reason} errorId={id("reason-error")} required>
              <select {...fieldProps("reason")} value={reason} onChange={(e) => setReason(e.target.value as Reason)}>
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {d.reason[r]}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={LABELS.name ?? ""} htmlFor={id("name")} error={errors.name} errorId={id("name-error")} required>
          <input {...fieldProps("name")} autoComplete="name" required maxLength={100} />
        </Field>
        {needsOrg ? (
          <Field label={LABELS.organization ?? ""} htmlFor={id("organization")} error={errors.organization} errorId={id("organization-error")} required>
            <input {...fieldProps("organization")} autoComplete="organization" maxLength={150} />
          </Field>
        ) : (
          <Field label={d.labels.language} htmlFor={id("language")}>
            <select id={id("language")} name="language" defaultValue={locale} className={inputClass()}>
              <option value="en" lang="en-US">
                {d.languages.en}
              </option>
              <option value="es" lang="es-US">
                {d.languages.es}
              </option>
            </select>
          </Field>
        )}
      </div>

      {isEnrollment ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={LABELS.childAge ?? ""} htmlFor={id("childAge")} error={errors.childAge} errorId={id("childAge-error")}>
            <select {...fieldProps("childAge")} defaultValue="">
              <option value="">{d.chooseOptional}</option>
              {CHILD_AGES.map((a) => (
                <option key={a} value={a}>
                  {d.childAge[a]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={LABELS.hasPrimaryDoctor ?? ""} htmlFor={id("hasPrimaryDoctor")}>
            <select {...fieldProps("hasPrimaryDoctor")} defaultValue="">
              <option value="">{d.chooseOptional}</option>
              {DOCTOR_ANSWERS.map((a) => (
                <option key={a} value={a}>
                  {d.doctor[a]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}

      {isJob ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={LABELS.position ?? ""} htmlFor={id("position")} error={errors.position} errorId={id("position-error")} required>
            <select {...fieldProps("position")} defaultValue={defaultPosition ?? ""}>
              <option value="" disabled>
                {d.chooseOne}
              </option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {d.position[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={LABELS.startDate ?? ""} htmlFor={id("startDate")} error={errors.startDate} errorId={id("startDate-error")}>
            <input {...fieldProps("startDate")} type="date" />
          </Field>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={LABELS.phone ?? ""} htmlFor={id("phone")} error={errors.phone} errorId={id("phone-error")}>
          <input {...fieldProps("phone")} type="tel" inputMode="tel" autoComplete="tel" maxLength={25} />
        </Field>
        <Field label={LABELS.email ?? ""} htmlFor={id("email")} error={errors.email} errorId={id("email-error")}>
          <input {...fieldProps("email")} type="email" autoComplete="email" maxLength={254} />
        </Field>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">{LABELS.preferredContact}</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {CONTACT_METHODS.map((m) => (
            <label
              key={m}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-cream px-4 has-[:checked]:border-teal has-[:checked]:bg-teal/10"
            >
              <input type="radio" name="preferredContact" value={m} defaultChecked={m === "phone"} className="h-4 w-4 accent-teal" />
              <span className="text-sm font-semibold">{d.contact[m]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label={LABELS.message ?? ""}
        htmlFor={id("message")}
        error={errors.message}
        errorId={id("message-error")}
        hint={messageHint ?? d.messageHint}
        hintId={id("message-hint")}
      >
        <textarea {...fieldProps("message", true)} rows={4} maxLength={1000} />
      </Field>

      {/* Honeypot: hidden from people and assistive tech, attractive to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>{d.honeypot}</label>
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
            {d.consentText}
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
          {submitting ? d.sending : (submitLabel ?? d.submit)}
        </button>
        <p className="text-sm text-muted">
          {d.preferTalk}{" "}
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
