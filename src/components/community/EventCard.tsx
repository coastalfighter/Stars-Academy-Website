import type { Locale } from "@/i18n/config";
import type { SiteSettings, StarsEvent } from "@/cms/repository";
import { communityCopy } from "@/content/copy/community";
import { site } from "@/content/site";
import { paragraphs } from "@/cms/localize";
import { dateBadge, whenText } from "@/lib/events/format";
import { eventAnchor, eventPlace, icsPath } from "@/lib/events/details";

/** One event: date badge, when and where, details, sign-up and add-to-calendar. */
export function EventCard({ event, locale, settings, headingLevel = 3 }: { event: StarsEvent; locale: Locale; settings: SiteSettings; headingLevel?: 2 | 3 }) {
  const t = communityCopy[locale].events;
  const badge = dateBadge(event.startsAt, locale);
  const place = eventPlace(event, locale, settings);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const chip = "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold";

  return (
    <article id={eventAnchor(event.slug)} aria-labelledby={`${eventAnchor(event.slug)}-title`} className="card flex scroll-mt-32 gap-5 p-6 sm:gap-7 sm:p-8">
      <div aria-hidden="true" className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-sand text-center sm:h-24 sm:w-20">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-berry-deep">{badge.month}</span>
        <span className="font-display text-3xl leading-none sm:text-4xl">{badge.day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2">
          <span className={`${chip} bg-teal/10 text-teal-deep`}>{t.audience[event.audience]}</span>
          {event.spanishAvailable ? (
            <span className={`${chip} bg-gold/20 text-ink`} lang={locale === "en" ? "es-US" : undefined}>
              {locale === "en" ? "En español" : t.spanish}
            </span>
          ) : null}
        </div>
        <Heading id={`${eventAnchor(event.slug)}-title`} className="mt-3 font-display text-2xl leading-tight" lang={event.title.lang}>
          {event.title.text}
        </Heading>
        <p className="mt-2 font-semibold text-ink">
          <time dateTime={event.startsAt}>{whenText(event, locale, t.allDay)}</time>
        </p>
        {place.name || place.address ? (
          <p className="mt-1 text-ink-soft">
            {[place.name, place.address].filter(Boolean).join(" · ")}
            {place.detail ? <span lang={event.locationDetail?.lang}> ({place.detail})</span> : null}
          </p>
        ) : null}
        {event.spanishAvailable && locale === "en" ? <p className="mt-1 text-sm text-muted">{t.spanish}</p> : null}
        {event.summary ? (
          <div className="mt-4 space-y-3 leading-relaxed text-ink-soft" lang={event.summary.lang}>
            {paragraphs(event.summary.text).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          {event.registration.kind === "call" ? (
            <p className="font-semibold">
              {t.registration.call}{" "}
              <a href={site.phone.href} className="whitespace-nowrap underline underline-offset-4">
                {site.phone.display}
              </a>
            </p>
          ) : event.registration.kind === "link" && event.registration.href ? (
            <a
              href={event.registration.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 font-semibold text-cream hover:bg-ink-soft"
            >
              {t.registration.link}
              <span className="sr-only"> {communityCopy[locale].resources.opensNewTab}</span>
            </a>
          ) : (
            <p className="text-muted">{t.registration.none}</p>
          )}
          <a
            href={icsPath(event.slug, locale)}
            download={`stars-${event.slug}.ics`}
            aria-label={t.addToCalendarFor.replace("{title}", event.title.text)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 font-semibold hover:border-ink/40"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
              <rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {t.addToCalendar}
          </a>
        </div>
      </div>
    </article>
  );
}
