import { buildIcs, escapeText, foldLine } from "@/lib/events/ics";
import { clockTime, dateBadge, whenText } from "@/lib/events/format";
import { eventJsonLd, eventPlace, placeLine } from "@/lib/events/details";
import { createIcsHandler } from "@/lib/events/icsHandler";
import type { StarsEvent } from "@/cms/repository";

const ev = (over: Partial<StarsEvent> = {}): StarsEvent => ({
  id: "e1",
  slug: "fall-open-house",
  title: { text: "Fall open house" },
  summary: { text: "Tour the classrooms; meet our team, too." },
  // 5:30 p.m. Central Daylight Time.
  startsAt: "2026-10-09T22:30:00.000Z",
  endsAt: "2026-10-10T00:30:00.000Z",
  allDay: false,
  audience: "families",
  location: "main",
  locationDetail: null,
  registration: { kind: "none", href: null },
  spanishAvailable: true,
  ...over,
});
const settings = { fax: null, email: null, southCampus: null };

describe("event times (clinic time zone, house style)", () => {
  it("formats times in Central Time", () => {
    expect(clockTime("2026-10-09T22:30:00Z", "en")).toBe("5:30 p.m.");
    expect(clockTime("2026-10-09T14:05:00Z", "es")).toBe("9:05 a. m.");
    // After the DST change, the same UTC hour is an hour earlier locally.
    expect(clockTime("2026-12-09T22:30:00Z", "en")).toBe("4:30 p.m.");
    expect(clockTime("2026-10-09T05:00:00Z", "en")).toBe("12:00 a.m.");
    expect(clockTime("2026-10-09T17:00:00Z", "en")).toBe("12:00 p.m.");
  });

  it("writes the when-line for ranges, open-ended and all-day events", () => {
    expect(whenText(ev(), "en", "All day")).toBe("Friday, October 9 · 5:30–7:30 p.m.");
    expect(whenText(ev({ startsAt: "2026-10-09T15:00:00Z", endsAt: "2026-10-09T19:00:00Z" }), "en", "All day")).toBe("Friday, October 9 · 10:00 a.m. – 2:00 p.m.");
    expect(whenText(ev({ endsAt: null }), "es", "Todo el día")).toBe("Viernes, 9 de octubre · 5:30 p. m.");
    expect(whenText(ev({ allDay: true, startsAt: "2026-10-09T05:00:00Z", endsAt: null }), "en", "All day")).toBe("Friday, October 9 · All day");
  });

  it("builds the date badge", () => {
    expect(dateBadge("2026-10-09T22:30:00Z", "en")).toEqual({ month: "Oct", day: "9", weekday: "Friday" });
    expect(dateBadge("2026-10-09T22:30:00Z", "es").month).toBe("oct");
  });
});

describe("iCalendar files", () => {
  it("escapes text and folds long lines without splitting characters", () => {
    expect(escapeText("a;b,c\\d\ne")).toBe("a\;b\\,c\\\\d\\ne");
    const folded = foldLine(`DESCRIPTION:${"é".repeat(60)}`);
    for (const line of folded.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, "")).toBe(`DESCRIPTION:${"é".repeat(60)}`);
  });

  it("writes UTC times, CRLF line endings and the required fields", () => {
    const ics = buildIcs(
      { uid: "x@stars.test", title: "Open house, fall", description: "Bring the kids", location: "200 General St.", url: "https://stars.test/events", startsAt: "2026-10-09T22:30:00Z", endsAt: null, allDay: false },
      new Date("2026-10-01T00:00:00Z"),
    );
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics).toContain("DTSTART:20261009T223000Z\r\n");
    expect(ics).toContain("DTEND:20261010T003000Z\r\n"); // default two hours
    expect(ics).toContain("SUMMARY:Open house\\, fall\r\n");
    expect(ics).toContain("DTSTAMP:20261001T000000Z");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics.split("\r\n").every((l) => !l.includes("\n"))).toBe(true);
  });

  it("uses clinic dates for all-day events, ending the day after", () => {
    const ics = buildIcs({ uid: "u", title: "Hiring day", startsAt: "2026-10-11T05:00:00Z", endsAt: null, allDay: true });
    expect(ics).toContain("DTSTART;VALUE=DATE:20261011\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20261012\r\n");
  });

  it("serves an upcoming event in the requested language, 404 otherwise", async () => {
    const handler = createIcsHandler({ events: async () => [ev()], settings: async () => settings, now: () => new Date("2026-10-01T00:00:00Z") });
    const params = (slug: string) => ({ params: Promise.resolve({ slug }) });
    const res = await handler(new Request("https://stars.test/api/events/fall-open-house/ics?lang=es"), params("fall-open-house"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
    expect(res.headers.get("content-disposition")).toContain('filename="stars-fall-open-house.ics"');
    const body = await res.text();
    expect(body).toContain("LOCATION:Sede principal de STARS\\, 200 General St.");
    expect(body).toContain("/es/eventos#event-fall-open-house");
    expect((await handler(new Request("https://stars.test/x"), params("gone"))).status).toBe(404);
    expect((await handler(new Request("https://stars.test/x"), params("../etc/passwd"))).status).toBe(404);
  });
});

describe("event places and structured data", () => {
  it("resolves campuses and free-text places", () => {
    expect(placeLine(eventPlace(ev(), "en", settings))).toBe("STARS main campus, 200 General St., Batesville, AR 72501");
    expect(eventPlace(ev({ location: "south" }), "en", settings).address).toBeNull();
    const southSettings = { ...settings, southCampus: { street: "1 Oak St.", city: "Batesville", region: "AR", postalCode: "72501", note: null } };
    expect(eventPlace(ev({ location: "south" }), "en", southSettings).address).toBe("1 Oak St., Batesville, AR 72501");
    expect(eventPlace(ev({ location: "other", locationDetail: { text: "Community Center" } }), "en", settings).name).toBe("Community Center");
  });

  it("describes events for search engines", () => {
    const ld = eventJsonLd(ev(), "en", settings);
    expect(ld).toMatchObject({
      "@type": "Event",
      name: "Fall open house",
      startDate: "2026-10-09T22:30:00.000Z",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", address: "200 General St., Batesville, AR 72501" },
      inLanguage: ["en-US", "es-US"],
    });
    expect(eventJsonLd(ev({ location: "online" }), "en", settings).location).toMatchObject({ "@type": "VirtualLocation" });
  });
});
