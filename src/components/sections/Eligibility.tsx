import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { href } from "@/i18n/routes";
import { getContent } from "@/content";
import { homeCopy } from "@/content/copy/home";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Eligibility({ locale }: { locale: Locale }) {
  const t = homeCopy[locale].eligibility;
  const d = getDictionary(locale);
  const { enrollmentSteps, fitSignals, site, photos } = getContent(locale);
  return (
    <section id="eligibility" aria-labelledby="eligibility-title" className="relative z-10 scroll-mt-24 bg-paper py-28 lg:py-36">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 id="eligibility-title" className="display-lg mt-5">
              {t.titleBefore} <em className="text-accent-deep">{t.titleEmphasis}</em> {t.titleAfter}
            </h2>
            <p className="lede mt-5">{t.lede}</p>
          </Reveal>
          <ul className="mt-8 space-y-3">
            {fitSignals.map((s, i) => (
              <Reveal as="li" key={s} delay={i * 70} className="flex gap-4 rounded-2xl bg-cream p-5">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-6 w-6 shrink-0 text-accent-deep">
                  <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
                  <path d="m7 12.5 3.2 3L17 8.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="leading-relaxed">{s}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-8 rounded-2xl border border-accent/60 bg-accent/10 p-5 leading-relaxed">
            <strong className="font-semibold">{t.payingLabel}</strong> {t.payingPrefix} {site.funding}. {t.payingBody}
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <Reveal className="relative overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={photos.parentChildWalk.src}
              alt={photos.parentChildWalk.alt}
              width={photos.parentChildWalk.width}
              height={photos.parentChildWalk.height}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>

          <Reveal className="mt-8">
            <h3 className="font-display text-2xl">{t.stepsTitle}</h3>
          </Reveal>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {enrollmentSteps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 80} className="card relative p-6">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-lg text-accent"
                >
                  {i + 1}
                </span>
                <h4 className="mt-4 font-display text-lg">
                  <span className="sr-only">
                    {d.common.step} {i + 1}:{" "}
                  </span>
                  {step.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href={href(locale, "gettingStarted", "#inquiry")} size="lg" arrow>
              {t.cta}
            </ButtonLink>
            <ButtonLink href={site.phone.href} size="lg" variant="ghost">
              {d.common.call} {site.phone.display}
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
