import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/routes";
import { getContent } from "@/content";
import { homeCopy } from "@/content/copy/home";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Pathways({ locale }: { locale: Locale }) {
  const t = homeCopy[locale].pathways;
  const { pathways } = getContent(locale);
  return (
    <section id="pathways" aria-labelledby="pathways-title" className="relative pb-24">
      <div className="container-x">
        <Reveal as="dl" className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line shadow-[var(--shadow-soft)] lg:grid-cols-4">
          {t.facts.map((f) => (
            <div key={f.k} className="bg-paper/95 p-5 backdrop-blur sm:p-6">
              <dt className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{f.k}</dt>
              <dd className="mt-2 font-display text-lg leading-snug sm:text-xl">{f.v}</dd>
            </div>
          ))}
        </Reveal>

        <div className="mt-16">
          <h2 id="pathways-title" className="eyebrow">{t.findYourWay}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pathways.map((p, i) => (
              <Reveal as="li" key={p.audience} delay={i * 80}>
                <Link
                  href={href(locale, p.key)}
                  className="group glass flex h-full flex-col justify-between gap-8 p-6 transition-transform duration-500 ease-[var(--ease-gentle)] hover:-translate-y-1"
                >
                  <span className="text-sm font-semibold text-muted">{p.audience}</span>
                  <span className="flex items-end justify-between gap-4 font-display text-xl leading-tight">
                    {p.action}
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-cream transition-colors group-hover:bg-accent-strong">
                      <Arrow />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
