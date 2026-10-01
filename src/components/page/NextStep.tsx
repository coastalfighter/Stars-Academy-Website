import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

export type RelatedLink = { title: string; body: string; href: string };

/** Closing call to action, optionally followed by related-page cards. */
export function NextStep({
  title,
  body,
  actions,
  related = [],
  locale = "en",
}: {
  locale?: Locale;
  title: ReactNode;
  body: ReactNode;
  actions: ReactNode;
  related?: readonly RelatedLink[];
}) {
  return (
    <section aria-labelledby="next-step-title" className="relative py-20 md:py-28">
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-[2.25rem] bg-ink px-6 py-14 text-cream sm:px-12 md:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-teal/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="eyebrow !text-accent">{getDictionary(locale).common.nextStep}</p>
            <h2 id="next-step-title" className="display-lg mt-4">
              {title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-cream/75">{body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">{actions}</div>
          </div>
        </Reveal>
        {related.length > 0 ? (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="group card flex h-full items-center justify-between gap-6 p-6 transition-transform hover:-translate-y-0.5">
                  <span>
                    <span className="block font-display text-xl">{r.title}</span>
                    <span className="mt-1 block text-ink-soft">{r.body}</span>
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-ink transition-colors group-hover:bg-accent">
                    <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
