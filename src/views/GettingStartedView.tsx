import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { href, serviceHref } from "@/i18n/routes";
import { faqsIn, getContent } from "@/content";
import { gettingStartedCopy } from "@/content/copy/gettingStarted";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { CheckList, StepList } from "@/components/page/Lists";
import { FaqList } from "@/components/page/FaqList";
import { NextStep } from "@/components/page/NextStep";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function GettingStartedView({ locale }: { locale: Locale }) {
  const t = gettingStartedCopy[locale];
  const d = getDictionary(locale);
  const c = getContent(locale);
  const { site, pages, photos } = c;
  const practical = [
    { title: t.practical.hours, body: site.hours.display },
    { title: t.practical.transportation, body: t.practical.transportationBody },
    { title: t.practical.language, body: t.practical.languageBody },
  ];

  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ label: t.crumb, href: href(locale, "gettingStarted") }]}
        eyebrow={t.eyebrow}
        title={t.title}
        lede={t.lede}
        accent="#e8735a"
        actions={
          <>
            <ButtonLink href="#inquiry" size="lg" arrow>
              {t.sendInquiry}
            </ButtonLink>
            <ButtonLink href={site.phone.href} size="lg" variant="ghost">
              {site.phone.display}
            </ButtonLink>
          </>
        }
      />

      <Section tone="paper" labelledBy="fit-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionIntro id="fit-title" eyebrow={t.fitEyebrow} title={t.fitTitle} lede={t.fitLede} />
            <CheckList items={pages.goodFitSignals} className="mt-8" />
          </div>
          <Reveal className="overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={photos.parentChildWalk.src}
              alt={photos.parentChildWalk.alt}
              width={photos.parentChildWalk.width}
              height={photos.parentChildWalk.height}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </Section>

      <Section labelledBy="eligibility-title">
        <SectionIntro id="eligibility-title" eyebrow={t.eligibilityEyebrow} title={t.eligibilityTitle} lede={t.eligibilityLede} />
        <div className="mt-10">
          <StepList steps={pages.eligibilityFactors} columns={3} locale={locale} />
        </div>
        <Reveal className="mt-8 rounded-2xl border border-gold/60 bg-gold/10 p-6 leading-relaxed">
          <strong className="font-semibold">{t.payingLabel}</strong> {t.payingPrefix} {site.funding}. {t.payingBody}
        </Reveal>
      </Section>

      <Section tone="ink" labelledBy="process-title">
        <SectionIntro id="process-title" tone="ink" eyebrow={t.processEyebrow} title={t.processTitle} />
        <div className="mt-10">
          <StepList steps={pages.firstCallToFirstDay} dark columns={5} locale={locale} />
        </div>
      </Section>

      <Section labelledBy="practical-title">
        <SectionIntro id="practical-title" eyebrow={t.practicalEyebrow} title={t.practicalTitle} />
        <dl className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {practical.map((p) => (
            <div key={p.title} className="card p-6">
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{p.title}</dt>
              <dd className="mt-2 leading-relaxed">{p.body}</dd>
            </div>
          ))}
          <div className="card p-6">
            <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{t.practical.medical}</dt>
            <dd className="mt-2 leading-relaxed">
              {t.practical.medicalBody}{" "}
              <Link href={serviceHref(locale, "nursing-care")} className="font-semibold text-teal-deep underline underline-offset-4">
                {t.practical.medicalLink}
              </Link>
              .
            </dd>
          </div>
        </dl>
      </Section>

      <Section id="inquiry" tone="sand" labelledBy="inquiry-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro id="inquiry-title" eyebrow={t.inquiryEyebrow} title={t.inquiryTitle} lede={t.inquiryLede} />
            <Reveal className="card mt-8 p-6">
              <h3 className="font-display text-lg">{t.packetTitle}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{t.packetBody}</p>
              <a
                href={site.secureForms.enrollmentPacket}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-semibold text-teal-deep underline decoration-2 underline-offset-4"
              >
                {t.packetLink}
                <span className="sr-only">{d.common.opensAdobe}</span>
              </a>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <InquiryForm
              locale={locale}
              audiences={["family"]}
              reasons={["eligibility", "tour", "question"]}
              defaultReason="eligibility"
              submitLabel={t.submit}
              messageHint={t.messageHint}
            />
          </div>
        </div>
      </Section>

      <Section labelledBy="gs-faq-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro id="gs-faq-title" eyebrow={t.faqEyebrow} title={t.faqTitle} />
            <ButtonLink href={href(locale, "faq")} variant="ghost" className="mt-6" arrow>
              {t.faqAll}
            </ButtonLink>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsIn(c, "families")} />
          </div>
        </div>
      </Section>

      <NextStep
        locale={locale}
        title={t.nextTitle}
        body={t.nextBody}
        actions={
          <>
            <ButtonLink href={href(locale, "tour")} variant="secondary" size="lg" arrow>
              {t.nextTour}
            </ButtonLink>
            <ButtonLink href={href(locale, "services")} variant="light" size="lg">
              {t.nextServices}
            </ButtonLink>
          </>
        }
        related={[
          { ...t.related[0]!, href: href(locale, "approach") },
          { ...t.related[1]!, href: serviceHref(locale, "nursing-care") },
        ]}
      />
    </>
  );
}
