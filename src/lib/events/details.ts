import type { Locale } from "@/i18n/config";
import { site } from "@/content/site";
import { href } from "@/i18n/routes";
import type { SiteSettings, StarsEvent } from "@/cms/repository";
import { communityCopy } from "@/content/copy/community";

export type EventPlace = { name: string; address: string | null; detail: string | null; online: boolean };

const mainAddress = () => `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;

/** Where an event happens, resolved from the campus choice and free-text details. */
export function eventPlace(e: Pick<StarsEvent, "location" | "locationDetail">, locale: Locale, settings: SiteSettings): EventPlace {
  const names = communityCopy[locale].events.location;
  const detail = e.locationDetail?.text ?? null;
  switch (e.location) {
    case "main":
      return { name: names.main, address: mainAddress(), detail, online: false };
    case "south": {
      const c = settings.southCampus;
      return { name: names.south, address: c ? `${c.street}, ${c.city}, ${c.region} ${c.postalCode}` : null, detail, online: false };
    }
    case "online":
      return { name: names.online, address: null, detail, online: true };
    default:
      return { name: detail ?? "", address: null, detail: null, online: false };
  }
}

/** One line for calendars: "STARS main campus, 200 General St., Batesville, AR 72501 (Room 4)". */
export function placeLine(p: EventPlace): string {
  return [p.name, p.address].filter(Boolean).join(", ") + (p.detail ? ` (${p.detail})` : "");
}

export const eventAnchor = (slug: string) => `event-${slug}`;
export const eventPageUrl = (locale: Locale, slug: string) => `${site.url}${href(locale, "events")}#${eventAnchor(slug)}`;
export const icsPath = (slug: string, locale: Locale) => `/api/events/${slug}/ics${locale === "es" ? "?lang=es" : ""}`;

/** schema.org Event, so search engines can show dates and the address. */
export function eventJsonLd(e: StarsEvent, locale: Locale, settings: SiteSettings): Record<string, unknown> {
  const place = eventPlace(e, locale, settings);
  return {
    "@type": "Event",
    name: e.title.text,
    ...(e.summary ? { description: e.summary.text } : {}),
    startDate: e.startsAt,
    ...(e.endsAt ? { endDate: e.endsAt } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: place.online ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    location: place.online
      ? { "@type": "VirtualLocation", url: e.registration.href ?? eventPageUrl(locale, e.slug) }
      : { "@type": "Place", name: place.name || site.name, ...(place.address ? { address: place.address } : {}) },
    organizer: { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url },
    isAccessibleForFree: true,
    inLanguage: e.spanishAvailable ? ["en-US", "es-US"] : locale === "es" ? "es-US" : "en-US",
    url: eventPageUrl(locale, e.slug),
  };
}
