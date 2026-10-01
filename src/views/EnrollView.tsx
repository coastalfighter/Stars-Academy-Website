import type { Locale } from "@/i18n/config";
import { href, serviceHref } from "@/i18n/routes";
import { enrollCopy } from "@/content/copy/enroll";
import { getContent } from "@/content";
import { getSecureChannels } from "@/cms/repository";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { EligibilityCheck } from "@/components/enroll/EligibilityCheck";

export async function EnrollView({ locale }: { locale: Locale }) {
  const t = enrollCopy[locale];
  const { site } = getContent(locale);
  const channels = await getSecureChannels(locale);
  const secure = channels.enrollmentForm;

  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.crumb, href: href(locale, "enroll") }]} eyebrow={t.eyebrow} title={t.title} lede={t.lede} star={null} />
      <Section tone="paper">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <EligibilityCheck
              locale={locale}
              links={{
                secureHref: secure.href,
                secureLang: secure.lang,
                phoneHref: site.phone.href,
                phoneDisplay: site.phone.display,
                askHref: `${href(locale, "gettingStarted")}#inquiry`,
                arkidsHref: `${href(locale, "resources")}#topic-insurance`,
                services: {
                  speech: serviceHref(locale, "speech-therapy"),
                  movement: serviceHref(locale, "physical-therapy"),
                  daily: serviceHref(locale, "occupational-therapy"),
                  medical: serviceHref(locale, "nursing-care"),
                },
              }}
            />
          </div>
          <aside className="space-y-5 lg:col-span-4">
            {/* Always available, including without JavaScript. */}
            <div className="rounded-[var(--radius-card)] border border-line bg-cream p-6">
              <h2 className="font-display text-xl">{t.readyTitle}</h2>
              <p className="mt-2 text-ink-soft">{t.readyBody}</p>
              <a
                href={secure.href}
                target="_blank"
                rel="noopener noreferrer"
                hrefLang={secure.lang ?? undefined}
                data-track="secure_form:enrollment"
                className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent-deep underline decoration-2 underline-offset-4"
              >
                {t.startSecure}
                <span className="sr-only"> {t.startSecureNote}</span>
              </a>
              {secure.lang && locale === "es" ? <p className="mt-2 text-sm text-muted">{t.inEnglishOnly}</p> : null}
            </div>
            <div className="rounded-[var(--radius-card)] border border-line bg-cream p-6">
              <h2 className="font-display text-xl">{t.stepsTitle}</h2>
              <ol className="mt-4 space-y-4">
                {t.steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/30 text-sm font-bold">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-semibold">{s.title}</span>
                      <span className="block text-sm text-ink-soft">{s.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
