import type { Locale } from "@/i18n/config";
import { getContent } from "@/content";
import { homeCopy } from "@/content/copy/home";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";

export function Trust({ locale }: { locale: Locale }) {
  const t = homeCopy[locale].trust;
  const { site, values } = getContent(locale);
  return (
    <section aria-labelledby="trust-title" className="relative z-10 bg-ink py-28 text-cream lg:py-36">
      <div className="container-x">
        <Reveal className="max-w-3xl">
          <p className="eyebrow !text-gold">{t.eyebrow}</p>
          <h2 id="trust-title" className="display-lg mt-5">
            {t.title}
          </h2>
        </Reveal>

        <dl className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-cream/10 sm:grid-cols-2 lg:grid-cols-4">
          {site.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} className="bg-ink p-8">
              <dt className="text-sm leading-snug text-cream/70">{s.label}</dt>
              <dd className="mt-3 font-display text-6xl text-gold tabular-nums">
                <CountUp value={s.value} />
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-16">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cream/60">{t.valuesTitle}</h3>
          <ul className="mt-6 grid gap-4 md:grid-cols-5">
            {values.map((v, i) => (
              <Reveal as="li" key={v.name} delay={i * 60} className="rounded-2xl border border-cream/10 p-5">
                <p className="font-display text-xl text-cream">{v.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{v.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
