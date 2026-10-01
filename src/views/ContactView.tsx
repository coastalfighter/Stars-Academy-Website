import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { hasLocale, href, type RouteKey } from "@/i18n/routes";
import { getContent } from "@/content";
import { contactCopy } from "@/content/copy/contact";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { ContactCard } from "@/components/page/ContactCard";
import { SouthCampusCard } from "@/components/cms/SouthCampusCard";
import { getSiteSettings } from "@/cms/repository";
import { getDictionary } from "@/i18n/dictionary";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Audience, Reason } from "@/lib/validation/inquiry";

const QUICK_KEYS: RouteKey[] = ["gettingStarted", "tour", "referrals", "careers"];

export async function ContactView({ locale, audience, reason }: { locale: Locale; audience?: Audience; reason?: Reason }) {
  const t = contactCopy[locale].contact;
  const { site, pages } = getContent(locale);
  const d = getDictionary(locale);
  const settings = await getSiteSettings(locale);
  const englishOnly = (key: RouteKey) => (hasLocale(key, locale) ? undefined : "en-US");

  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.crumb, href: href(locale, "contact") }]} eyebrow={t.eyebrow} title={t.title} lede={t.lede} star={null}>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {t.quick.map((item, i) => {
            const key = QUICK_KEYS[i]!;
            return (
              <li key={key}>
                <Link
                  href={href(locale, key)}
                  hrefLang={englishOnly(key)}
                  className="group glass flex h-full flex-col justify-between gap-4 p-5 transition-transform hover:-translate-y-0.5"
                >
                  <span className="text-sm text-muted">{item.q}</span>
                  <span className="flex items-center justify-between gap-3 font-display text-lg">
                    {item.label} <Arrow />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </PageHero>

      <Section tone="paper" className="!pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Reveal>
              <h2 className="display-md">{t.direct}</h2>
              <a href={site.phone.href} className="mt-4 block font-display text-4xl text-teal-deep">
                {site.phone.display}
              </a>
              <p className="mt-2 text-ink-soft">{site.hours.display}</p>
              {settings.fax || settings.email ? (
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-ink-soft">
                  {settings.fax ? (
                    <>
                      <dt className="font-semibold text-ink">{d.cms.fax}</dt>
                      <dd>{settings.fax}</dd>
                    </>
                  ) : null}
                  {settings.email ? (
                    <>
                      <dt className="font-semibold text-ink">{d.cms.email}</dt>
                      <dd>
                        <a href={`mailto:${settings.email}`} className="underline underline-offset-4">
                          {settings.email}
                        </a>
                      </dd>
                    </>
                  ) : null}
                </dl>
              ) : null}
            </Reveal>
            <ContactCard locale={locale} />
            {settings.southCampus ? <SouthCampusCard campus={settings.southCampus} locale={locale} /> : null}
            <Reveal className="card p-6">
              <h3 className="font-display text-xl">{t.who}</h3>
              <ul className="mt-4 space-y-4">
                {pages.whoHandlesWhat.map((w) => (
                  <li key={w.team}>
                    <Link href={href(locale, w.key)} hrefLang={englishOnly(w.key)} className="font-semibold underline-offset-4 hover:underline">
                      {w.team}
                    </Link>
                    <p className="text-sm leading-relaxed text-ink-soft">{w.body}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <h2 className="sr-only">{t.sendMessage}</h2>
            <InquiryForm locale={locale} defaultAudience={audience} defaultReason={reason ?? "question"} submitLabel={t.submit} />
          </div>
        </div>
      </Section>
    </>
  );
}
