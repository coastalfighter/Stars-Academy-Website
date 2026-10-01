"use client";

import Link from "next/link";
import { services as enServices, type Service } from "@/content/services";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { serviceHref } from "@/i18n/routes";
import { getContent } from "@/content";
import { homeCopy, type HomeCopy } from "@/content/copy/home";
import { useMotion } from "@/components/providers/MotionProvider";
import { Arrow } from "@/components/ui/Button";
import { StarSpikes } from "@/components/three/HeroStar";
import { Reveal } from "@/components/ui/Reveal";
import { serviceIndexAt } from "@/lib/scroll/timeline";
import { useScrollDerived } from "@/lib/scroll/useScrollDerived";
import { PINNED_QUERY, useMediaQuery } from "@/lib/hooks/useMediaQuery";

const selectService = (p: number) => serviceIndexAt(p, enServices.length);

type Props = { locale: Locale; t: HomeCopy["services"]; services: Service[] };

function Intro({ t, compact = false }: { t: HomeCopy["services"]; compact?: boolean }) {
  return (
    <div>
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 id="services-title" className={compact ? "display-md mt-4" : "display-lg mt-5"}>
        {t.titleA} <span className="text-accent-deep">{t.titleB}</span>
      </h2>
      <p className={compact ? "mt-3 leading-relaxed text-ink-soft short:text-[0.95rem]" : "lede mt-5"}>
        {t.lede}
      </p>
    </div>
  );
}

function PinnedServices({ locale, t, services }: Props) {
  const d = getDictionary(locale);
  const active = useScrollDerived(selectService);
  const { webgl } = useMotion();

  return (
    <div className="relative h-[460vh]">
      <div className="sticky-below-banner flex items-center pt-28 pb-8 short:pb-4">
        <div className="container-x grid grid-cols-12 items-center gap-10">
          <div className="col-span-6 xl:col-span-5">
            <Intro t={t} compact />
            <ol className="mt-6 space-y-1 short:mt-4">
              {services.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.slug}>
                    <div
                      aria-current={on ? "true" : undefined}
                      className={`overflow-hidden rounded-3xl border transition-[background-color,border-color,box-shadow] duration-700 ease-[var(--ease-gentle)] ${
                        on ? "border-white/70 bg-cream/90 shadow-[var(--shadow-lift)] backdrop-blur-xl" : "border-transparent"
                      }`}
                    >
                      <Link href={serviceHref(locale, s.slug)} className="group flex items-center gap-4 px-5 py-2.5 short:py-2">
                        <span className="w-6 text-xs font-bold tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                        <span
                          aria-hidden="true"
                          className={`h-3 w-3 rotate-45 rounded-[3px] transition-transform duration-500 ${on ? "scale-125" : "scale-90 opacity-60"}`}
                          style={{ background: s.color }}
                        />
                        <span className={`font-display text-xl transition-colors xl:text-2xl ${on ? "text-ink" : "text-muted group-hover:text-ink"}`}>
                          {s.name}
                        </span>
                      </Link>
                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-gentle)] ${
                          on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-5 pb-4 pl-[4.25rem]">
                            <p className="text-sm font-semibold text-muted">{s.short}</p>
                            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-ink-soft short:hidden">
                              {s.provides.slice(0, 3).map((item) => (
                                <li key={item} className="flex gap-2">
                                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                                  {item}
                                </li>
                              ))}
                            </ul>
                            <Link
                              href={serviceHref(locale, s.slug)}
                              tabIndex={on ? 0 : -1}
                              className="group mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent-deep"
                            >
                              {d.common.learnAbout} {locale === "en" ? s.name.toLowerCase() : s.name.charAt(0).toLowerCase() + s.name.slice(1)} <Arrow />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="col-span-6 flex justify-center xl:col-span-7" aria-hidden="true">
            {/* Scene slot: the 3D star is drawn here (src/lib/scene/slots.ts); the flat star when 3D is off. */}
            <div data-scene-slot="services" className="relative aspect-square w-full max-w-[min(100%,58svh)]">
              {!webgl ? <StaticStar active={active} /> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticStar({ active }: { active: number }) {
  return <StarSpikes highlight={active} className="h-full w-full animate-float-slow" />;
}

function ListServices({ locale, t, services }: Props) {
  const d = getDictionary(locale);
  return (
    <div className="container-x py-28">
      <Reveal className="max-w-3xl">
        <Intro t={t} />
      </Reveal>
      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal as="li" key={s.slug} delay={i * 60}>
            <Link href={serviceHref(locale, s.slug)} className="group card flex h-full flex-col p-7 transition-transform duration-500 hover:-translate-y-1">
              <span className="flex items-center gap-3 text-xs font-bold tabular-nums text-muted">
                <span aria-hidden="true" className="h-3 w-3 rotate-45 rounded-[3px]" style={{ background: s.color }} />
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-5 font-display text-2xl">{s.name}</span>
              <span className="mt-2 flex-1 leading-relaxed text-ink-soft">{s.short}</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent-deep">
                {d.common.learnMore} <Arrow />
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

export function ServicesScroller({ locale }: { locale: Locale }) {
  const props: Props = { locale, t: homeCopy[locale].services, services: getContent(locale).services };
  const { calm, ready } = useMotion();
  const desktop = useMediaQuery(PINNED_QUERY);
  return (
    <section id="services" aria-labelledby="services-title" className="relative scroll-mt-24">
      {ready && !calm && desktop ? <PinnedServices {...props} /> : <ListServices {...props} />}
    </section>
  );
}
