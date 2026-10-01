import type { Locale } from "@/i18n/config";
import { CLINIC_TIME_ZONE } from "@/lib/analytics/normalize";

/**
 * Event dates and times, always in the clinic's time zone (an event at
 * 5:30 p.m. in Batesville reads 5:30 p.m. whoever is looking), in the house
 * styles the rest of the site uses: "5:30 p.m." (AP) and "5:30 p. m." (RAE).
 */

const INTL: Record<Locale, string> = { en: "en-US", es: "es-US" };

function parts(iso: string, locale: Locale, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of new Intl.DateTimeFormat(INTL[locale], { timeZone: CLINIC_TIME_ZONE, ...options }).formatToParts(new Date(iso))) {
    out[p.type] = p.value;
  }
  return out;
}

/** Calendar date in the clinic's time zone, as YYYY-MM-DD. */
export function clinicDate(iso: string): string {
  const p = parts(iso, "en", { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${p.year}-${p.month}-${p.day}`;
}

export function clockTime(iso: string, locale: Locale): string {
  const p = parts(iso, "en", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const h = Number(p.hour) % 24;
  const pm = h >= 12;
  const suffix = locale === "es" ? (pm ? "p. m." : "a. m.") : pm ? "p.m." : "a.m.";
  return `${((h + 11) % 12) + 1}:${p.minute} ${suffix}`;
}

/** Date badge pieces, e.g. { month: "Oct", day: "9", weekday: "Friday" }. */
export function dateBadge(iso: string, locale: Locale): { month: string; day: string; weekday: string } {
  const p = parts(iso, locale, { month: "short", day: "numeric", weekday: "long" });
  return { month: (p.month ?? "").replace(".", ""), day: p.day ?? "", weekday: p.weekday ?? "" };
}

export function longDate(iso: string, locale: Locale): string {
  const text = new Intl.DateTimeFormat(INTL[locale], { timeZone: CLINIC_TIME_ZONE, weekday: "long", month: "long", day: "numeric" }).format(new Date(iso));
  return locale === "es" ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/**
 * "Friday, October 9 · 5:30–7:30 p.m." style line. Multi-day events show both
 * dates; all-day events say so instead of a time.
 */
export function whenText(
  e: { startsAt: string; endsAt: string | null; allDay: boolean },
  locale: Locale,
  allDayLabel: string,
): string {
  const startDay = longDate(e.startsAt, locale);
  if (e.allDay) {
    const endDay = e.endsAt && clinicDate(e.endsAt) !== clinicDate(e.startsAt) ? ` – ${longDate(e.endsAt, locale)}` : "";
    return `${startDay}${endDay} · ${allDayLabel}`;
  }
  const start = clockTime(e.startsAt, locale);
  if (!e.endsAt) return `${startDay} · ${start}`;
  const end = clockTime(e.endsAt, locale);
  if (clinicDate(e.endsAt) !== clinicDate(e.startsAt)) return `${startDay}, ${start} – ${longDate(e.endsAt, locale)}, ${end}`;
  // Same half of the day: "5:30–7:30 p.m."; otherwise both suffixes.
  const startSuffix = start.split(" ").slice(1).join(" ");
  const endSuffix = end.split(" ").slice(1).join(" ");
  return startSuffix === endSuffix ? `${startDay} · ${start.split(" ")[0]}–${end}` : `${startDay} · ${start} – ${end}`;
}
