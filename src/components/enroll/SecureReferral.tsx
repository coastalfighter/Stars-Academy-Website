import type { Locale } from "@/i18n/config";
import type { SecureChannels } from "@/cms/repository";
import { enrollCopy } from "@/content/copy/enroll";
import { site } from "@/content/site";
import { Section, SectionIntro } from "@/components/page/Section";

/**
 * How referral partners send prescriptions and records: only the channels
 * STARS has set up (and approved, for upload links) are listed. Calling
 * the intake team is always offered.
 */
export function SecureReferral({ channels, locale = "en" }: { channels: SecureChannels; locale?: Locale }) {
  const t = enrollCopy[locale].referral;
  const card = "rounded-[var(--radius-card)] border border-line bg-paper p-6";
  return (
    <Section id="secure-referral" tone="sand" labelledBy="secure-referral-title">
      <SectionIntro id="secure-referral-title" eyebrow={t.eyebrow} title={t.title} lede={t.lede} />
      <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {channels.referralUpload ? (
          <li className={card}>
            <h3 className="font-display text-xl">{t.upload}</h3>
            <p className="mt-2 text-ink-soft">{t.uploadBody}</p>
            <a
              href={channels.referralUpload}
              target="_blank"
              rel="noopener noreferrer"
              data-track="secure_form:referral"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-5 font-semibold text-cream hover:bg-ink-soft"
            >
              {t.upload}
              <span className="sr-only"> {enrollCopy[locale].startSecureNote}</span>
            </a>
          </li>
        ) : null}
        {channels.directAddress ? (
          <li className={card}>
            <h3 className="font-display text-xl">{t.direct}</h3>
            <p className="mt-2 text-ink-soft">{t.directBody}</p>
            <p className="mt-3 break-all font-mono text-sm font-semibold">{channels.directAddress}</p>
          </li>
        ) : null}
        {channels.fax ? (
          <li className={card}>
            <h3 className="font-display text-xl">{t.fax}</h3>
            <p className="mt-2 text-ink-soft">{t.faxBody}</p>
            <p className="mt-3 text-lg font-semibold">{channels.fax}</p>
          </li>
        ) : null}
        <li className={card}>
          <h3 className="font-display text-xl">{t.phone}</h3>
          <p className="mt-2 text-ink-soft">{t.phoneBody}</p>
          <a href={site.phone.href} className="mt-3 inline-block text-lg font-semibold underline underline-offset-4">
            {site.phone.display}
          </a>
        </li>
      </ul>
    </Section>
  );
}
