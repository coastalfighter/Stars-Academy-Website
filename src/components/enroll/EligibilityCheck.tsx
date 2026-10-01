"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { enrollCopy } from "@/content/copy/enroll";
import { buttonClass } from "@/components/ui/Button";
import { track } from "@/lib/analytics/client";
import { AGES, COVERAGE, DOCTOR, EMPTY_ANSWERS, NEEDS, evaluate, type Answers } from "@/lib/enroll/eligibility";

type Links = {
  secureHref: string;
  /** Set when the secure form is only available in the other language. */
  secureLang: string | null;
  phoneHref: string;
  phoneDisplay: string;
  askHref: string;
  arkidsHref: string;
  services: { speech: string; movement: string; daily: string; medical: string };
};

const STEPS = ["age", "coverage", "doctor", "needs"] as const;
type Step = (typeof STEPS)[number];

/**
 * Four-question enrollment check. Everything happens in the browser: no
 * answer is sent, stored or logged (only an anonymous "a check finished
 * with result X" count, under the site's analytics rules).
 */
export function EligibilityCheck({ locale, links }: { locale: Locale; links: Links }) {
  const t = enrollCopy[locale];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [showError, setShowError] = useState(false);
  const [done, setDone] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    // Move focus to the new question or result so screen readers announce it (not on first render).
    if (moved.current) heading.current?.focus();
  }, [step, done]);

  const current: Step = STEPS[step]!;
  const answered = current === "needs" || answers[current] !== null;
  const outcome = evaluate(answers);

  const go = (next: number) => {
    moved.current = true;
    setShowError(false);
    setStep(next);
  };
  const forward = () => {
    if (!answered) {
      setShowError(true);
      return;
    }
    if (step < STEPS.length - 1) go(step + 1);
    else {
      moved.current = true;
      setDone(true);
      track("eligibility_check", evaluate(answers).kind);
    }
  };
  const restart = () => {
    setAnswers(EMPTY_ANSWERS);
    setDone(false);
    go(0);
  };

  const radio = "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-line bg-cream px-4 py-3 has-[:checked]:border-teal has-[:checked]:bg-teal/10 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-teal";

  if (done) {
    const r = t.results[outcome.kind];
    const services = answers.needs.filter((n): n is Exclude<typeof n, "unsure"> => n !== "unsure");
    return (
      <div className="card p-6 sm:p-10" aria-live="polite">
        <h2 ref={heading} tabIndex={-1} className="display-md outline-none">
          {r.title}
        </h2>
        <p className="lede mt-3">{r.body}</p>
        {outcome.reasons.length > 0 ? (
          <ul className="mt-5 list-disc space-y-2 pl-6 text-ink-soft">
            {outcome.reasons.map((reason) => (
              <li key={reason}>
                {t.results.reasons[reason]}
                {reason === "none" ? (
                  <>
                    {" "}
                    <Link href={links.arkidsHref} className="font-semibold text-teal-deep underline underline-offset-4">
                      {t.arkids}
                    </Link>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {services.length > 0 && outcome.kind !== "age" ? (
          <div className="mt-6">
            <h3 className="font-semibold">{t.results.servicesTitle}</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {services.map((s) => (
                <li key={s}>
                  <Link href={links.services[s]} className="inline-flex min-h-11 items-center rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold hover:border-ink/40">
                    {t.results.services[s]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {outcome.kind !== "age" ? (
            <a href={links.secureHref} target="_blank" rel="noopener noreferrer" data-track="secure_form:enrollment" className={buttonClass(outcome.kind === "fit" ? "primary" : "ghost", "lg")}>
              {t.startSecure}
              <span className="sr-only"> {t.startSecureNote}</span>
            </a>
          ) : null}
          <a href={links.phoneHref} className={buttonClass(outcome.kind === "fit" ? "ghost" : "primary", "lg")}>
            {t.call}: {links.phoneDisplay}
          </a>
          <Link href={links.askHref} className={buttonClass("ghost", "lg")}>
            {t.ask}
          </Link>
        </div>
        {outcome.kind !== "age" ? (
          <p className="mt-4 text-sm text-muted">
            {t.startSecureNote} {links.secureLang && locale === "es" ? t.inEnglishOnly : null}
          </p>
        ) : null}
        <button type="button" onClick={restart} className="mt-8 text-sm font-semibold text-ink-soft underline underline-offset-4">
          {t.startOver}
        </button>
      </div>
    );
  }

  const q = t.questions[current];
  const name = `enroll-${current}`;
  return (
    <form
      className="card p-6 sm:p-10"
      onSubmit={(e) => {
        e.preventDefault();
        forward();
      }}
    >
      <p className="text-sm font-semibold text-teal-deep">{t.progress.replace("{n}", String(step + 1)).replace("{total}", String(STEPS.length))}</p>
      <div aria-hidden="true" className="mt-2 h-1.5 rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-teal transition-[width] duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <fieldset className="mt-6" aria-describedby={showError ? `${name}-error` : current === "needs" ? `${name}-hint` : undefined}>
        <legend>
          <h2 ref={heading} tabIndex={-1} className="display-md outline-none">
            {q.legend}
          </h2>
        </legend>
        {current === "needs" ? (
          <p id={`${name}-hint`} className="mt-2 text-ink-soft">
            {t.questions.needs.hint}
          </p>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {current === "needs"
            ? NEEDS.map((n) => (
                <label key={n} className={radio}>
                  <input
                    type="checkbox"
                    name={name}
                    value={n}
                    checked={answers.needs.includes(n)}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, needs: e.target.checked ? [...a.needs, n] : a.needs.filter((x) => x !== n) }))
                    }
                    className="h-5 w-5 shrink-0 accent-teal"
                  />
                  <span>{t.questions.needs.options[n]}</span>
                </label>
              ))
            : (current === "age" ? AGES : current === "coverage" ? COVERAGE : DOCTOR).map((value) => (
                <label key={value} className={radio}>
                  <input
                    type="radio"
                    name={name}
                    value={value}
                    checked={answers[current] === value}
                    onChange={() => {
                      setShowError(false);
                      setAnswers((a) => ({ ...a, [current]: value }));
                    }}
                    className="h-5 w-5 shrink-0 accent-teal"
                  />
                  <span>{(q.options as Record<string, string>)[value]}</span>
                </label>
              ))}
        </div>
      </fieldset>
      {showError ? (
        <p id={`${name}-error`} role="alert" className="mt-4 font-semibold text-berry-deep">
          {t.chooseOne}
        </p>
      ) : null}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => go(step - 1)} className={buttonClass("ghost", "md")}>
            {t.back}
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className={buttonClass("primary", "md")}>
          {step === STEPS.length - 1 ? t.seeResult : t.next}
        </button>
      </div>
      <p className="mt-6 text-sm text-muted">{t.privacyNote}</p>
    </form>
  );
}
