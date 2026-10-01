"use client";

import { useCallback } from "react";
import type { Locale } from "@/i18n/config";
import { getContent, type ContentBundle } from "@/content";
import { homeCopy, type HomeCopy } from "@/content/copy/home";
import { useMotion } from "@/components/providers/MotionProvider";
import { Reveal } from "@/components/ui/Reveal";
import { DAY_CHAPTER, dayHourAt, dayIndexAt, formatHour, localProgress, smoothstep } from "@/lib/scroll/timeline";
import { useScrollDerived } from "@/lib/scroll/useScrollDerived";
import { DESKTOP_QUERY, useMediaQuery } from "@/lib/hooks/useMediaQuery";

type Props = { locale: Locale; t: HomeCopy["day"]; c: ContentBundle };

function Intro({ t }: { t: HomeCopy["day"] }) {
  return (
    <div className="max-w-xl">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 id="day-title" className="display-lg mt-5">
        {t.title}
      </h2>
      <p className="lede mt-5">{t.lede}</p>
    </div>
  );
}

/** Pinned, scroll-scrubbed timeline for large screens with motion enabled. */
function PinnedDay({ locale, t, c }: Props) {
  const count = c.dayTimeline.length;
  const selectIndex = useCallback((p: number) => dayIndexAt(p, count), [count]);
  /** Clock rounded to 5-minute steps so it ticks rather than flickers. */
  const selectClock = useCallback(
    (p: number) => formatHour(Math.round(dayHourAt(smoothstep(0.02, 0.98, localProgress(p, DAY_CHAPTER))) * 12) / 12, locale),
    [locale],
  );
  const active = useScrollDerived(selectIndex);
  const clock = useScrollDerived(selectClock);

  return (
    <div className="relative h-[420vh]">
      <div className="sticky-below-banner flex flex-col justify-between pt-36 pb-12">
        <div className="container-x flex items-start justify-between gap-10">
          <Intro t={t} />
          <div className="glass hidden shrink-0 px-7 py-5 text-right xl:block" aria-hidden="true">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{t.now}</p>
            <p data-testid="day-clock" className="mt-1 font-display text-5xl tabular-nums">{clock}</p>
          </div>
        </div>

        <div className="container-x">
          <div className="relative mb-6 h-1 rounded-full bg-ink/10" aria-hidden="true">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-coral via-accent to-accent transition-[width] duration-700 ease-[var(--ease-gentle)]"
              style={{ width: `${((active + 1) / count) * 100}%` }}
            />
          </div>
          <ol className="grid grid-cols-5 gap-4">
            {c.dayTimeline.map((m, i) => {
              const on = i === active;
              return (
                <li
                  key={m.title}
                  aria-current={on ? "step" : undefined}
                  className={`glass p-5 transition-[opacity,transform,box-shadow] duration-700 ease-[var(--ease-gentle)] ${
                    on ? "-translate-y-3 shadow-[var(--shadow-lift)] ring-2 ring-accent/70" : "shadow-none"
                  }`}
                >
                  <p className={`text-xs font-bold uppercase tracking-[0.16em] ${on ? "text-berry-deep" : "text-muted"}`}>{m.time}</p>
                  <h3 className="mt-2 font-display text-xl leading-tight">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.body}</p>
                </li>
              );
            })}
          </ol>
          <p className="mt-6 text-sm text-muted">
            {t.scheduleNote} {c.site.hours.display}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Static vertical timeline — small screens, calm mode, and no-JS. */
function ListDay({ t, c }: Props) {
  return (
    <div className="container-x py-28">
      <Reveal className="over-scene">
        <Intro t={t} />
      </Reveal>
      <ol className="relative mt-12 space-y-5 border-l-2 border-dashed border-ink/15 pl-6 sm:pl-8">
        {c.dayTimeline.map((m, i) => (
          <Reveal as="li" key={m.title} delay={i * 60} className="card relative p-6">
            <span aria-hidden="true" className="absolute top-7 -left-[calc(1.5rem+7px)] h-3 w-3 rounded-full border-2 border-cream bg-accent sm:-left-[calc(2rem+7px)]" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-berry-deep">{m.time}</p>
            <h3 className="mt-2 font-display text-xl">{m.title}</h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{m.body}</p>
          </Reveal>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">
        {t.scheduleNote} {c.site.hours.display}
      </p>
    </div>
  );
}

export function DayAtStars({ locale }: { locale: Locale }) {
  const { calm, ready } = useMotion();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const props: Props = { locale, t: homeCopy[locale].day, c: getContent(locale) };
  return (
    <section aria-labelledby="day-title" className="relative">
      {ready && !calm && desktop ? <PinnedDay {...props} /> : <ListDay {...props} />}
    </section>
  );
}
