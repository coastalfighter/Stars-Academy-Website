import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/routes";
import { communityCopy } from "@/content/copy/community";
import { getEvents, getSiteSettings } from "@/cms/repository";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { EventCard } from "@/components/community/EventCard";
import { eventJsonLd } from "@/lib/events/details";

export async function EventsView({ locale }: { locale: Locale }) {
  const t = communityCopy[locale].events;
  const [events, settings] = await Promise.all([getEvents(locale), getSiteSettings(locale)]);

  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.crumb, href: href(locale, "events") }]} eyebrow={t.eyebrow} title={t.title} lede={t.lede} star={null} />
      <Section tone="paper" labelledBy="events-title">
        <h2 id="events-title" className="display-md">
          {t.upcomingTitle}
        </h2>
        {events.length > 0 ? (
          <ul className="mt-8 grid gap-5 lg:max-w-4xl">
            {events.map((e) => (
              <li key={e.id}>
                <EventCard event={e} locale={locale} settings={settings} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card mt-8 max-w-2xl p-8">
            <p className="font-display text-2xl">{t.emptyTitle}</p>
            <p className="mt-3 leading-relaxed text-ink-soft">{t.emptyBody}</p>
            <ButtonLink href={href(locale, "tour")} className="mt-6" arrow>
              {t.emptyCta}
            </ButtonLink>
          </div>
        )}
      </Section>
      {events.length > 0 ? (
        <JsonLd data={{ "@context": "https://schema.org", "@graph": events.map((e) => eventJsonLd(e, locale, settings)) }} />
      ) : null}
    </>
  );
}
