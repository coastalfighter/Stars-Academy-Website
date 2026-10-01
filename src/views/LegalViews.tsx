import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/routes";
import { getContent } from "@/content";
import { legalCopy } from "@/content/copy/legal";
import { LegalPage } from "@/components/page/LegalPage";

export function PrivacyView({ locale }: { locale: Locale }) {
  const t = legalCopy[locale].privacy;
  const { site } = getContent(locale);
  return (
    <LegalPage locale={locale} crumbHref={href(locale, "privacy")} crumb={t.crumb} eyebrow={t.eyebrow} title={t.title} lede={t.lede}>
      {t.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          {section.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>
      ))}
      <h2>{t.contactTitle}</h2>
      <p>
        {t.contactBefore} <a href={site.phone.href}>{site.phone.display}</a> {t.contactMiddle}{" "}
        <Link href={href(locale, "contact")}>{t.contactLink}</Link>.
      </p>
    </LegalPage>
  );
}

export function AccessibilityView({ locale }: { locale: Locale }) {
  const t = legalCopy[locale].accessibility;
  const { site } = getContent(locale);
  return (
    <LegalPage locale={locale} crumbHref={href(locale, "accessibility")} crumb={t.crumb} eyebrow={t.eyebrow} title={t.title} lede={t.lede}>
      <h2>{t.commitmentTitle}</h2>
      <p>{t.commitmentIntro}</p>
      <ul>
        {t.commitments.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <h2>{t.calmTitle}</h2>
      <p>{t.calmBody}</p>
      <h2>{t.ongoingTitle}</h2>
      <p>{t.ongoingBody}</p>
      <h2>{t.barrierTitle}</h2>
      <p>
        {t.barrierBefore} <a href={site.phone.href}>{site.phone.display}</a> {t.barrierMiddle}{" "}
        <Link href={href(locale, "contact")}>{t.barrierLink}</Link>
        {t.barrierAfter}
      </p>
    </LegalPage>
  );
}

/**
 * The complete USDA statement (with program-information and complaint-filing
 * instructions) must be inserted exactly as provided by STARS' sponsoring
 * agency — tracked in docs/CONTENT-CHECKLIST.md. Legal text is not paraphrased.
 */
export function NondiscriminationView({ locale }: { locale: Locale }) {
  const t = legalCopy[locale].nondiscrimination;
  const { nondiscriminationSummary } = getContent(locale);
  return (
    <LegalPage locale={locale} crumbHref={href(locale, "nondiscrimination")} crumb={t.crumb} eyebrow={t.eyebrow} title={t.title}>
      <p>{t.intro}</p>
      <p>{nondiscriminationSummary}</p>
      <p>
        <strong>{t.equalOpportunity}</strong>
      </p>
      {t.translationNote ? <p className="text-base text-muted">{t.translationNote}</p> : null}
    </LegalPage>
  );
}
