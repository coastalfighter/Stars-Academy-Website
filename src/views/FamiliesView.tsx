import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { hasLocale, href, serviceHref } from "@/i18n/routes";
import { getContent } from "@/content";
import { faqsInGroup, getAnnouncements, getEvents, getFaqs, getSiteSettings } from "@/cms/repository";
import { communityCopy } from "@/content/copy/community";
import { EventCard } from "@/components/community/EventCard";
import { AnnouncementList } from "@/components/cms/AnnouncementList";
import { familiesCopy } from "@/content/copy/families";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { FaqList } from "@/components/page/FaqList";
import { NextStep } from "@/components/page/NextStep";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export async function FamiliesView({ locale }: { locale: Locale }) {
  const t = familiesCopy[locale];
  const d = getDictionary(locale);
  const { site, pages } = getContent(locale);
  const [announcements, faqs, events, settings] = await Promise.all([getAnnouncements(locale), getFaqs(locale), getEvents(locale), getSiteSettings(locale)]);
  const c = communityCopy[locale];
  const nextEvents = events.filter((e) => e.audience === "families" || e.audience === "community").slice(0, 2);
  const resources = [
    { ...t.resources[0]!, href: site.consciousDisciplineUrl, external: true },
    { ...t.resources[1]!, href: href(locale, "approach"), external: false },
    { ...t.resources[2]!, href: site.social.facebook, external: true },
  ];
  const toc = [
    ...(announcements.length ? [{ id: "announcements", title: d.cms.announcementsEyebrow }] : []),
    ...pages.familyTopics.map((topic) => ({ id: topic.id, title: topic.title })),
    { id: "resources", title: t.resourcesNav },
    { id: "contact", title: t.contactNav },
  ];

  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ label: t.crumb, href: href(locale, "families") }]}
        eyebrow={t.eyebrow}
        title={t.title}
        lede={t.lede}
        accent="#4f86c6"
        actions={
          <ButtonLink href={site.phone.href} size="lg">
            {d.common.call} {site.phone.display}
          </ButtonLink>
        }
      />

      <Section tone="paper" labelledBy="topics-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <nav aria-labelledby="topics-title" className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(8rem+var(--announce-h,0px))]">
              <h2 id="topics-title" className="eyebrow">
                {d.common.onThisPage}
              </h2>
              <ul className="mt-5 space-y-1">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="block rounded-xl px-3 py-2 font-semibold text-ink-soft hover:bg-cream hover:text-ink">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <div className="space-y-5 lg:col-span-8">
            {announcements.length ? (
              <section aria-labelledby="announcements" className="mb-10">
                <p className="eyebrow">{d.cms.announcementsEyebrow}</p>
                <h3 id="announcements" className="mt-3 scroll-mt-28 font-display text-3xl">
                  {d.cms.announcementsTitle}
                </h3>
                <div className="mt-6">
                  <AnnouncementList items={announcements} locale={locale} />
                </div>
              </section>
            ) : null}
            {pages.familyTopics.map((topic) => (
              <Reveal as="section" key={topic.id} className="card p-7 sm:p-9">
                <h3 id={topic.id} className="scroll-mt-28 font-display text-2xl">
                  {topic.title}
                </h3>
                <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">
                  {topic.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                {topic.id === "absences" ? (
                  <a href={site.phone.href} className="mt-4 inline-block font-semibold text-teal-deep underline underline-offset-4">
                    {t.callAbsence} {site.phone.display}
                  </a>
                ) : null}
                {topic.id === "health" ? (
                  <Link href={serviceHref(locale, "nursing-care")} className="mt-4 inline-block font-semibold text-teal-deep underline underline-offset-4">
                    {t.nursingLink}
                  </Link>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {nextEvents.length > 0 ? (
        <Section id="events" tone="sand" labelledBy="events-teaser-title">
          <SectionIntro id="events-teaser-title" eyebrow={c.events.teaserEyebrow} title={c.events.teaserTitle} />
          <ul className="mt-10 grid gap-5 lg:grid-cols-2">
            {nextEvents.map((e) => (
              <li key={e.id}>
                <EventCard event={e} locale={locale} settings={settings} />
              </li>
            ))}
          </ul>
          <ButtonLink href={href(locale, "events")} variant="ghost" className="mt-8" arrow>
            {c.events.teaserAll}
          </ButtonLink>
        </Section>
      ) : null}

      <Section id="resources" labelledBy="resources-title">
        <SectionIntro id="resources-title" eyebrow={t.resourcesEyebrow} title={t.resourcesTitle} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {resources.map((r) => (
            <li key={r.title}>
              {r.external ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="card block h-full p-6 transition-transform hover:-translate-y-0.5">
                  <span className="font-display text-xl">{r.title}</span>
                  <span className="sr-only">{d.common.opensNewTab}</span>
                  <span className="mt-2 block leading-relaxed text-ink-soft">{r.body}</span>
                </a>
              ) : (
                <Link href={r.href} className="card block h-full p-6 transition-transform hover:-translate-y-0.5">
                  <span className="font-display text-xl">{r.title}</span>
                  <span className="mt-2 block leading-relaxed text-ink-soft">{r.body}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
        <ButtonLink href={href(locale, "resources")} variant="ghost" className="mt-8" arrow>
          {c.resources.browseAll}
        </ButtonLink>
      </Section>

      <Section id="contact" tone="sand" labelledBy="contact-title">
        <SectionIntro id="contact-title" eyebrow={t.contactEyebrow} title={t.contactTitle} />
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pages.whoHandlesWhat.map((w) => (
            <li key={w.team} className="card p-6">
              <Link
                href={href(locale, w.key)}
                hrefLang={hasLocale(w.key, locale) ? undefined : "en-US"}
                className="font-display text-lg underline-offset-4 hover:underline"
              >
                {w.team}
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{w.body}</p>
              <a href={site.phone.href} className="mt-4 inline-block font-semibold text-teal-deep">
                {site.phone.display}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="quick-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro id="quick-title" eyebrow={t.quickEyebrow} title={t.quickTitle} />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsInGroup(faqs, "current")} />
          </div>
        </div>
      </Section>

      <NextStep
        locale={locale}
        title={t.nextTitle}
        body={t.nextBody}
        actions={
          <ButtonLink href={`${href(locale, "contact")}?audience=current-family&reason=current-family`} variant="secondary" size="lg" arrow>
            {t.nextCta}
          </ButtonLink>
        }
        related={[
          { ...t.related[0]!, href: serviceHref(locale, "nursing-care") },
          { ...t.related[1]!, href: href(locale, "faq") },
        ]}
      />
    </>
  );
}
