"use client";

import { useCallback, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { getContent, type ContentBundle } from "@/content";
import { homeCopy, type HomeCopy } from "@/content/copy/home";
import { useMotion } from "@/components/providers/MotionProvider";
import { Reveal } from "@/components/ui/Reveal";
import { DAY_CHAPTER, dayHourAt, dayIndexAt, formatHour, localProgress, smoothstep } from "@/lib/scroll/timeline";
import { useScrollDerived } from "@/lib/scroll/useScrollDerived";
import { sunArc } from "@/lib/scene/slots";
import { PINNED_QUERY, useMediaQuery } from "@/lib/hooks/useMediaQuery";

type Props = { locale: Locale; t: HomeCopy["day"]; c: ContentBundle };

function Intro({ t, children }: { t: HomeCopy["day"]; children?: ReactNode }) {
  return (
    <div className="max-w-xl">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 id="day-title" className="display-lg mt-5 short:text-[clamp(1.6rem,2.8vw,2.3rem)] short:leading-[1.12]">
        {t.title}
      </h2>
      <p className="lede mt-5 short:mt-3">{t.lede}</p>
      {children}
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
      <div className="sticky-below-banner flex flex-col justify-between pt-36 pb-12 short:pt-28 short:pb-6">
        <div className="container-x flex items-stretch gap-10">
          <Intro t={t}>
            <p aria-hidden="true" className="mt-6 inline-flex items-baseline gap-3 rounded-full border border-white/70 bg-white/70 px-5 py-2 short:mt-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{t.now}</span>
              <span data-testid="day-clock" className="font-display text-2xl tabular-nums">{clock}</span>
            </p>
          </Intro>
          {/* Scene slot: the sun crosses this space as the day goes by (src/lib/scene/slots.ts). */}
          <div data-scene-slot="day" aria-hidden="true" className="relative hidden min-h-40 flex-1 lg:block">
            <FlatSun />
          </div>
        </div>

        <div className="container-x">
          <div className="relative mb-6 h-1 rounded-full bg-ink/10 short:mb-4" aria-hidden="true">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-lilac via-accent to-accent transition-[width] duration-700 ease-[var(--ease-gentle)]"
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
                  className={`glass p-5 short:p-4 transition-[opacity,transform,box-shadow] duration-700 ease-[var(--ease-gentle)] ${
                    on ? "-translate-y-3 shadow-[var(--shadow-lift)] ring-2 ring-accent/70" : "shadow-none"
                  }`}
                >
                  <p className={`text-xs font-bold uppercase tracking-[0.16em] ${on ? "text-rose-deep" : "text-muted"}`}>{m.time}</p>
                  <h3 className="mt-2 font-display text-xl leading-tight short:mt-1 short:text-lg">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.body}</p>
                </li>
              );
            })}
          </ol>
          <p className="mt-6 text-sm text-muted short:mt-3">
            {t.scheduleNote} {c.site.hours.display}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The sun for screens without the 3D scene: same arc, drawn with CSS. Only
 * shown when 3D is off; the 3D sun is drawn into the same slot otherwise.
 */
function FlatSun() {
  const { webgl } = useMotion();
  const selectArc = useCallback((p: number) => {
    const { u, v } = sunArc(smoothstep(0.02, 0.98, localProgress(p, DAY_CHAPTER)));
    // Rounded so the component re-renders in small steps, not every frame.
    return `${Math.round(u * 200) / 2}% ${Math.round((1 - v) * 200) / 2}%`;
  }, []);
  const position = useScrollDerived(selectArc);
  if (webgl) return null;
  const [left, top] = position.split(" ");
  return (
    <span
      className="absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff,var(--color-pink)_75%)] shadow-[0_0_60px_20px_rgb(255_143_216/0.35)] transition-[left,top] duration-500 ease-[var(--ease-gentle)]"
      style={{ left, top }}
    />
  );
}

/** Static vertical timeline — small screens, calm mode, and no-JS. */
function ListDay({ t, c }: Props) {
  return (
    <div className="container-x py-28">
      <Reveal>
        <Intro t={t} />
      </Reveal>
      <ol className="relative mt-12 space-y-5 border-l-2 border-dashed border-ink/15 pl-6 sm:pl-8">
        {c.dayTimeline.map((m, i) => (
          <Reveal as="li" key={m.title} delay={i * 60} className="card relative p-6">
            <span aria-hidden="true" className="absolute top-7 -left-[calc(1.5rem+7px)] h-3 w-3 rounded-full border-2 border-cream bg-accent sm:-left-[calc(2rem+7px)]" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-deep">{m.time}</p>
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
  const desktop = useMediaQuery(PINNED_QUERY);
  const props: Props = { locale, t: homeCopy[locale].day, c: getContent(locale) };
  return (
    <section aria-labelledby="day-title" className="relative">
      {ready && !calm && desktop ? <PinnedDay {...props} /> : <ListDay {...props} />}
    </section>
  );
}
