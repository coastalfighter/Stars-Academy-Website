import type { Locale } from "@/i18n/config";
import { site } from "@/content/site";
import { getEvents, getSiteSettings, type SiteSettings, type StarsEvent } from "@/cms/repository";
import { eventPageUrl, eventPlace, placeLine } from "./details";
import { buildIcs } from "./ics";

type Deps = {
  events?: (locale: Locale) => Promise<StarsEvent[]>;
  settings?: (locale: Locale) => Promise<SiteSettings>;
  now?: () => Date;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** GET /api/events/:slug/ics?lang=es: one upcoming event as an .ics download. */
export function createIcsHandler({ events = getEvents, settings = getSiteSettings, now = () => new Date() }: Deps = {}) {
  return async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
    const { slug } = await params;
    if (!SLUG.test(slug) || slug.length > 96) return new Response("Not found", { status: 404 });
    const locale: Locale = new URL(request.url).searchParams.get("lang") === "es" ? "es" : "en";

    const [list, siteSettings] = await Promise.all([events(locale), settings(locale)]);
    const event = list.find((e) => e.slug === slug);
    if (!event) return new Response("This event isn’t on the calendar anymore.", { status: 404, headers: { "Cache-Control": "no-store" } });

    const url = eventPageUrl(locale, event.slug);
    const description = [event.summary?.text, `${site.name} · ${site.phone.display}`, url].filter(Boolean).join("\n\n");
    const body = buildIcs(
      {
        uid: `${event.slug}@${new URL(site.url).hostname}`,
        title: event.title.text,
        description,
        location: placeLine(eventPlace(event, locale, siteSettings)) || null,
        url,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        allDay: event.allDay,
      },
      now(),
    );
    return new Response(body, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="stars-${event.slug}.ics"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  };
}
