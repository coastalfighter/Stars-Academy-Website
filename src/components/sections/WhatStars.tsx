import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/content";
import { homeCopy } from "@/content/copy/home";
import { Reveal } from "@/components/ui/Reveal";

const DOTS = ["bg-accent", "bg-teal", "bg-berry"] as const;

export function WhatStars({ locale }: { locale: Locale }) {
  const t = homeCopy[locale].what;
  const { pillars, photos } = getContent(locale);
  return (
    <section aria-labelledby="what-title" className="relative py-28 lg:min-h-[140vh] lg:py-40">
      <div className="container-x">
        <div className="over-scene copy-col">
          <Reveal>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 id="what-title" className="display-lg mt-5">
              {t.titleA} <span className="text-teal-deep">{t.titleB}</span>
            </h2>
            <p className="lede mt-6">
              {t.lede}
            </p>
          </Reveal>

          <ol className="mt-12 space-y-4">
            {pillars.map((p, i) => (
              <Reveal as="li" key={p.n} delay={i * 90} className="card flex gap-5 p-6">
                <span aria-hidden="true" className={`mt-1 h-3 w-3 shrink-0 rotate-45 rounded-[3px] ${DOTS[i]}`} />
                <div>
                  <h3 className="font-display text-xl">
                    <span className="sr-only">{p.n}. </span>
                    {p.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-40 w-32 shrink-0 overflow-hidden rounded-[1.5rem] shadow-[var(--shadow-lift)]">
              <Image src={photos.storyTime.src} alt={photos.storyTime.alt} fill sizes="128px" className="object-cover" />
            </div>
            <p className="font-display text-2xl leading-snug">
              {t.quoteA} <span className="text-berry-deep">{t.quoteB}</span>
            </p>
          </Reveal>
          <p className="sr-only">
            {t.illustration}
          </p>
        </div>
      </div>
    </section>
  );
}
