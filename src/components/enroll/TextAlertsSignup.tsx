import type { Locale } from "@/i18n/config";
import type { SecureChannels } from "@/cms/repository";
import { enrollCopy } from "@/content/copy/enroll";
import { Section, SectionIntro } from "@/components/page/Section";

const fill = (s: string, v: { keyword: string; number: string }) => s.replaceAll("{keyword}", v.keyword).replaceAll("{number}", v.number);

/**
 * Text-to-join sign-up for closure alerts. Families text a keyword to the
 * provider's number; the provider keeps the list. Shown only when staff
 * have set up the number and keyword.
 */
export function TextAlertsSignup({ alerts, locale }: { alerts: NonNullable<SecureChannels["textAlerts"]>; locale: Locale }) {
  const t = enrollCopy[locale].textAlerts;
  const v = { keyword: alerts.keyword, number: alerts.number };
  return (
    <Section id="text-alerts" tone="paper" labelledBy="text-alerts-title">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <SectionIntro id="text-alerts-title" eyebrow={t.eyebrow} title={t.title} lede={t.lede} />
        </div>
        <div className="card p-6 sm:p-8 lg:col-span-6">
          <p className="font-display text-2xl">{fill(t.instruction, v)}</p>
          <a
            href={alerts.smsHref}
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-cream hover:bg-ink-soft"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M4 5h16v11H9l-5 4V5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            {fill(t.button, v)}
          </a>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">{fill(t.consent, v)}</p>
          <p className="mt-3 text-sm text-muted">{t.privacy}</p>
        </div>
      </div>
    </Section>
  );
}
