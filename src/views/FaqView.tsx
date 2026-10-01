import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/routes";
import { faqsIn, getContent } from "@/content";
import { faqSchema } from "@/content/faq";
import { faqCopy } from "@/content/copy/faq";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { FaqList } from "@/components/page/FaqList";
import { NextStep } from "@/components/page/NextStep";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";

export function FaqView({ locale }: { locale: Locale }) {
  const t = faqCopy[locale];
  const c = getContent(locale);
  const { site, faqGroups, faqs } = c;

  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ label: t.crumb, href: href(locale, "faq") }]}
        eyebrow={t.eyebrow}
        title={t.title}
        lede={
          <>
            {t.ledeBefore}{" "}
            <a href={site.phone.href} className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
              {site.phone.display}
            </a>
            {locale === "en" ? " " : ""}
            {t.ledeAfter}
          </>
        }
        star={null}
      >
        <nav aria-label={t.topics} className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {faqGroups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-ink/10 bg-white/70 px-4 text-sm font-semibold hover:border-ink/30"
                >
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      {faqGroups.map((g, i) => (
        <Section key={g.id} id={g.id} tone={i % 2 === 0 ? "paper" : "cream"} labelledBy={`${g.id}-title`} className="!py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 id={`${g.id}-title`} className="display-md lg:col-span-4">
              {g.label}
            </h2>
            <div className="lg:col-span-8">
              <FaqList items={faqsIn(c, g.id)} />
            </div>
          </div>
        </Section>
      ))}
      <JsonLd data={{ ...faqSchema(faqs), inLanguage: locale === "es" ? "es-US" : "en-US" }} />

      <NextStep
        locale={locale}
        title={t.nextTitle}
        body={t.nextBody}
        actions={
          <>
            <ButtonLink href={href(locale, "contact")} variant="secondary" size="lg" arrow>
              {t.nextContact}
            </ButtonLink>
            <ButtonLink href={href(locale, "tour")} variant="light" size="lg">
              {t.nextTour}
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
