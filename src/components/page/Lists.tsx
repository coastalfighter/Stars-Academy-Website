import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import type { Step } from "@/content/pages";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export function CheckIcon({ className = "mt-0.5 h-6 w-6 shrink-0 text-teal" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
      <path d="m7 12.5 3.2 3L17 8.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Bulleted list with check marks. */
export function CheckList({ items, className = "" }: { items: readonly ReactNode[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <Reveal as="li" key={i} delay={i * 50} className="flex gap-3 leading-relaxed">
          <CheckIcon />
          <span>{item}</span>
        </Reveal>
      ))}
    </ul>
  );
}

/** Numbered process steps as cards. */
export function StepList({
  steps,
  dark = false,
  columns = 4,
  locale = "en",
}: {
  steps: readonly Step[];
  dark?: boolean;
  columns?: 3 | 4 | 5;
  locale?: Locale;
}) {
  const stepWord = getDictionary(locale).common.step;
  const cols = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" }[columns];
  return (
    <ol className={`grid gap-4 sm:grid-cols-2 ${cols}`}>
      {steps.map((step, i) => (
        <Reveal
          as="li"
          key={step.title}
          delay={i * 70}
          className={dark ? "rounded-[var(--radius-card)] border border-cream/10 p-6" : "card p-6"}
        >
          <span className={`font-display text-4xl ${dark ? "text-accent" : "text-teal-deep"}`}>{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-3 font-display text-xl">
            <span className="sr-only">
              {stepWord} {i + 1}:{" "}
            </span>
            {step.title}
          </h3>
          <p className={`mt-2 leading-relaxed ${dark ? "text-cream/75" : "text-ink-soft"}`}>{step.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}

/** Title + body cards in a grid (e.g. "why it works", "why STARS"). */
export function FeatureGrid({ items, columns = 3 }: { items: readonly Step[]; columns?: 2 | 3 | 4 }) {
  const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 xl:grid-cols-4" }[columns];
  const accents = ["bg-accent", "bg-coral", "bg-teal", "bg-blue", "bg-berry"];
  return (
    <ul className={`grid gap-4 ${cols}`}>
      {items.map((item, i) => (
        <Reveal as="li" key={item.title} delay={i * 70} className="card p-7">
          <span aria-hidden="true" className={`block h-1.5 w-10 rounded-full ${accents[i % accents.length]}`} />
          <h3 className="mt-4 font-display text-xl leading-snug">{item.title}</h3>
          <p className="mt-2 leading-relaxed text-ink-soft">{item.body}</p>
        </Reveal>
      ))}
    </ul>
  );
}
