"use client";

import Link from "next/link";
import { services } from "@/content/services";
import { useMotion } from "@/components/providers/MotionProvider";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { serviceIndexAt } from "@/lib/scroll/timeline";
import { useScrollDerived } from "@/lib/scroll/useScrollDerived";
import { DESKTOP_QUERY, useMediaQuery } from "@/lib/hooks/useMediaQuery";

const selectService = (p: number) => serviceIndexAt(p, services.length);

function Intro({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <p className="eyebrow">Services</p>
      <h2 id="services-title" className={compact ? "display-md mt-4" : "display-lg mt-5"}>
        Everything your child needs, <span className="text-teal-deep">under one roof.</span>
      </h2>
      <p className={compact ? "mt-3 leading-relaxed text-ink-soft" : "lede mt-5"}>
        Five disciplines, one coordinated plan. Each is led by professionals in that field — and they work together
        every day around the same child.
      </p>
    </div>
  );
}

function PinnedServices() {
  const active = useScrollDerived(selectService);
  const { webgl } = useMotion();

  return (
    <div className="relative h-[460vh]">
      <div className="sticky top-0 flex h-screen items-center pt-28 pb-6">
        <div className="container-x grid grid-cols-12 items-center gap-10">
          <div className="col-span-6 xl:col-span-5">
            <Intro compact />
            <ol className="mt-6 space-y-1">
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
                      <Link href={`/services/${s.slug}`} className="group flex items-center gap-4 px-5 py-2.5">
                        <span className="w-6 text-xs font-bold tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                        <span
                          aria-hidden="true"
                          className={`h-3 w-3 rotate-45 rounded-[3px] transition-transform duration-500 ${on ? "scale-125" : "scale-90 opacity-60"}`}
                          style={{ background: s.color }}
                        />
                        <span className={`font-display text-xl transition-colors xl:text-2xl ${on ? "text-ink" : "text-ink/45 group-hover:text-ink/80"}`}>
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
                            <ul className="mt-2 space-y-1 text-sm leading-relaxed text-ink-soft">
                              {s.provides.slice(0, 3).map((item) => (
                                <li key={item} className="flex gap-2">
                                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                                  {item}
                                </li>
                              ))}
                            </ul>
                            <Link
                              href={`/services/${s.slug}`}
                              tabIndex={on ? 0 : -1}
                              className="group mt-3 inline-flex items-center gap-2 text-sm font-bold text-teal-deep"
                            >
                              Learn about {s.name.toLowerCase()} <Arrow />
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
          <div className="col-span-6 xl:col-span-7" aria-hidden="true">
            {!webgl ? <StaticStar active={active} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticStar({ active }: { active: number }) {
  const color = services[active]?.color ?? "#f2c230";
  return (
    <svg viewBox="0 0 48 48" className="mx-auto h-80 w-80 animate-float-slow drop-shadow-xl">
      <path d="M24 4.5 29.3 17.3l13.7 1.1-10.4 9 3.2 13.4L24 33.6l-11.8 7.2 3.2-13.4-10.4-9 13.7-1.1Z" fill={color} className="transition-colors duration-700" />
    </svg>
  );
}

function ListServices() {
  return (
    <div className="container-x py-28">
      <Reveal className="over-scene max-w-3xl">
        <Intro />
      </Reveal>
      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal as="li" key={s.slug} delay={i * 60}>
            <Link href={`/services/${s.slug}`} className="group card flex h-full flex-col p-7 transition-transform duration-500 hover:-translate-y-1">
              <span className="flex items-center gap-3 text-xs font-bold tabular-nums text-muted">
                <span aria-hidden="true" className="h-3 w-3 rotate-45 rounded-[3px]" style={{ background: s.color }} />
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-5 font-display text-2xl">{s.name}</span>
              <span className="mt-2 flex-1 leading-relaxed text-ink-soft">{s.short}</span>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-deep">
                Learn more <Arrow />
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

export function ServicesScroller() {
  const { calm, ready } = useMotion();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  return (
    <section id="services" aria-labelledby="services-title" className="relative scroll-mt-24">
      {ready && !calm && desktop ? <PinnedServices /> : <ListServices />}
    </section>
  );
}
