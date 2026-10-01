import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { href, serviceHref } from "@/i18n/routes";
import { getContent } from "@/content";
import { servicesCopy } from "@/content/copy/services";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { FeatureGrid } from "@/components/page/Lists";
import { NextStep } from "@/components/page/NextStep";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function ServicesView({ locale }: { locale: Locale }) {
  const t = servicesCopy[locale].index;
  const d = getDictionary(locale);
  const { services, site, pages } = getContent(locale);

  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.crumb, href: href(locale, "services") }]} eyebrow={t.eyebrow} title={t.title} lede={t.lede} />

      <Section tone="paper" labelledBy="together-title">
        <SectionIntro id="together-title" eyebrow={t.togetherEyebrow} title={t.togetherTitle} />
        <div className="mt-10">
          <FeatureGrid items={pages.togetherReasons} />
        </div>
      </Section>

      <Section labelledBy="services-list-title">
        <SectionIntro id="services-list-title" eyebrow={t.listEyebrow} title={t.listTitle} />
        <ol className="mt-10 space-y-5">
          {services.map((s, i) => (
            <Reveal as="li" key={s.slug}>
              <article className="card grid gap-8 overflow-hidden p-7 sm:p-10 lg:grid-cols-12" aria-labelledby={`svc-${s.slug}`}>
                <div className="lg:col-span-5">
                  <p className="flex items-center gap-3 text-sm font-bold tabular-nums text-muted">
                    <span aria-hidden="true" className="h-3.5 w-3.5 rotate-45 rounded-[3px]" style={{ background: s.color }} />
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 id={`svc-${s.slug}`} className="mt-4 font-display text-3xl">
                    {s.name}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-soft">{s.what}</p>
                  <Link href={serviceHref(locale, s.slug)} className="group mt-6 inline-flex items-center gap-2 font-bold text-accent-deep">
                    {d.common.learnMore}
                    <span className="sr-only">
                      {" "}
                      {t.learnMoreAbout} {s.name}
                    </span>{" "}
                    <Arrow />
                  </Link>
                </div>
                <ul className="space-y-3 lg:col-span-7">
                  {s.provides.slice(0, 3).map((p) => (
                    <li key={p} className="flex gap-3 rounded-2xl bg-cream p-4 leading-relaxed">
                      <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="sand" labelledBy="pay-title">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <SectionIntro id="pay-title" eyebrow={t.fundingEyebrow} title={t.fundingTitle} />
          <Reveal className="space-y-4 text-lg leading-relaxed text-ink-soft">
            <p>
              {t.fundingPrefix} {site.funding}. {t.fundingBody}
            </p>
            <p>{t.prescription}</p>
            <ButtonLink href={href(locale, "gettingStarted")} arrow>
              {t.fundingCta}
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <NextStep
        locale={locale}
        title={t.nextTitle}
        body={t.nextBody}
        actions={
          <>
            <ButtonLink href={href(locale, "gettingStarted", "#inquiry")} variant="secondary" size="lg" arrow>
              {t.nextStart}
            </ButtonLink>
            <ButtonLink href={href(locale, "tour")} variant="light" size="lg">
              {t.nextTour}
            </ButtonLink>
          </>
        }
        related={[
          { ...t.related[0]!, href: href(locale, "approach") },
          { ...t.related[1]!, href: href(locale, "referrals") },
        ]}
      />
    </>
  );
}
