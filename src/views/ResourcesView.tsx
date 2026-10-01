import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/routes";
import { communityCopy } from "@/content/copy/community";
import { getResources, type Resource } from "@/cms/repository";
import { RESOURCE_TOPICS, type ResourceTopic } from "@/cms/schemas";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { NextStep } from "@/components/page/NextStep";
import { ButtonLink } from "@/components/ui/Button";
import { getContent } from "@/content";

const topicId = (t: ResourceTopic) => `topic-${t}`;

function ResourceItem({ r, locale }: { r: Resource; locale: Locale }) {
  const t = communityCopy[locale].resources;
  const external = r.kind !== "page";
  const materialLabel = r.materialLang ? (r.materialLang.startsWith("es") ? t.inSpanish : t.inEnglish) : null;
  const title = (
    <>
      <span lang={r.title.lang}>{r.title.text}</span>
      {external ? (
        <>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="ml-1.5 inline h-3.5 w-3.5 align-baseline">
            <path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sr-only"> {t.opensNewTab}</span>
        </>
      ) : null}
    </>
  );
  const linkClass = "font-display text-xl leading-snug text-ink underline decoration-teal/40 decoration-2 underline-offset-4 hover:decoration-teal";

  return (
    <li className="card flex h-full flex-col p-6">
      <h3>
        {external ? (
          <a href={r.href} target="_blank" rel="noopener noreferrer" hrefLang={r.materialLang ?? undefined} className={linkClass}>
            {title}
          </a>
        ) : (
          <Link href={r.href} className={linkClass}>
            {title}
          </Link>
        )}
      </h3>
      <p className="mt-3 flex-1 leading-relaxed text-ink-soft" lang={r.summary.lang}>
        {r.summary.text}
      </p>
      <p className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="rounded-full bg-sand px-3 py-1 text-ink">{t.kind[r.kind]}</span>
        {materialLabel ? <span className="rounded-full bg-gold/20 px-3 py-1 text-ink">{materialLabel}</span> : null}
        {r.publisher ? (
          <span className="font-semibold text-muted">
            {t.from} {r.publisher}
          </span>
        ) : null}
      </p>
    </li>
  );
}

export async function ResourcesView({ locale }: { locale: Locale }) {
  const t = communityCopy[locale].resources;
  const { site } = getContent(locale);
  const resources = await getResources(locale);
  const topics = RESOURCE_TOPICS.filter((topic) => resources.some((r) => r.topic === topic));

  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.crumb, href: href(locale, "resources") }]} eyebrow={t.eyebrow} title={t.title} lede={t.lede} star={null} />
      <div className="bg-paper pb-4">
        <nav aria-label={t.topicsNav} className="container-x pt-10">
          <ul className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <li key={topic}>
                <a
                  href={`#${topicId(topic)}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-ink/15 bg-cream px-4 text-sm font-semibold hover:border-ink/40"
                >
                  {t.topics[topic]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {topics.map((topic, i) => (
        <Section key={topic} id={topicId(topic)} tone={i % 2 === 0 ? "paper" : "cream"} labelledBy={`${topicId(topic)}-title`} className="!py-14 md:!py-16">
          <h2 id={`${topicId(topic)}-title`} className="display-md">
            {t.topics[topic]}
          </h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resources
              .filter((r) => r.topic === topic)
              .map((r) => (
                <ResourceItem key={r.id} r={r} locale={locale} />
              ))}
          </ul>
        </Section>
      ))}
      <div className="container-x pt-10">
        <p className="max-w-3xl text-sm text-muted">{t.disclaimer}</p>
      </div>
      <NextStep
        locale={locale}
        title={t.nextTitle}
        body={
          <>
            {t.nextBody}{" "}
            <a href={site.phone.href} className="whitespace-nowrap font-semibold text-cream underline underline-offset-4">
              {site.phone.display}
            </a>
          </>
        }
        actions={
          <ButtonLink href={href(locale, "contact")} variant="secondary" size="lg" arrow>
            {t.nextCta}
          </ButtonLink>
        }
      />
    </>
  );
}
