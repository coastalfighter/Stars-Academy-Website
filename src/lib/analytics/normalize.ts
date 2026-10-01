import { ROUTES, SERVICE_SLUGS, type RouteKey } from "@/i18n/routes";
import type { Locale } from "@/i18n/config";
import { EVENTS, type Beacon, type EventName } from "./protocol";

/**
 * Turns raw beacons into bounded, non-identifying dimensions.
 *
 * Everything recorded comes from a fixed vocabulary (page keys, channels,
 * devices, event names) except referrer hosts and campaign tags, which are
 * sanitised to short tokens and capped per day by the store.
 */

export type PageKey = RouteKey | `service:${string}` | "other";
export type Channel = "direct" | "search" | "social" | "email" | "referral" | "campaign";
export type Device = "mobile" | "tablet" | "desktop";

const PATHS = new Map<string, { key: PageKey; locale: Locale }>();
for (const [key, route] of Object.entries(ROUTES) as [RouteKey, { en: string; es: string | null }][]) {
  PATHS.set(route.en, { key, locale: "en" });
  if (route.es) PATHS.set(route.es, { key, locale: "es" });
}
for (const [id, slugs] of Object.entries(SERVICE_SLUGS)) {
  PATHS.set(`${ROUTES.services.en}/${slugs.en}`, { key: `service:${id}`, locale: "en" });
  PATHS.set(`${ROUTES.services.es}/${slugs.es}`, { key: `service:${id}`, locale: "es" });
}

/** Maps a pathname to a known page. Unknown paths (404s, typos, probes) become "other". */
export function pageFromPath(raw: string): { key: PageKey; locale: Locale } {
  const path = (raw.split(/[?#]/)[0] ?? "/").replace(/(.)\/+$/, "$1") || "/";
  return PATHS.get(path) ?? { key: "other", locale: path === "/es" || path.startsWith("/es/") ? "es" : "en" };
}

/** Lowercase token of [a-z0-9._-], at most 40 chars; empty when nothing usable is left. */
export function token(raw: unknown, max = 40): string {
  if (typeof raw !== "string") return "";
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, max);
}

const HOST = /^(?=.{1,100}$)([a-z0-9-]+\.)+[a-z]{2,}$/;

/** Validates a referrer hostname and drops "www." / "m." prefixes. */
export function referrerHost(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const host = raw.toLowerCase().trim().replace(/^(www|m|l|lm)\./, "");
  return HOST.test(host) ? host : "";
}

const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|baidu|yandex|brave|startpage)\.[a-z.]+$/;
const SOCIAL = /(^|\.)(facebook\.com|fb\.com|instagram\.com|t\.co|twitter\.com|x\.com|linkedin\.com|lnkd\.in|youtube\.com|tiktok\.com|pinterest\.com|nextdoor\.com|reddit\.com|threads\.net)$/;
const EMAIL = /(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|mail\.yahoo\.com)$/;

export function channelFor(host: string, utmSource: string, utmMedium: string): Channel {
  if (utmSource) return utmMedium === "email" ? "email" : "campaign";
  if (!host) return "direct";
  if (EMAIL.test(host)) return "email";
  if (SEARCH.test(host)) return "search";
  if (SOCIAL.test(host)) return "social";
  return "referral";
}

export function deviceFor(width: unknown): Device {
  const w = typeof width === "number" && Number.isFinite(width) ? width : 1024;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

/** Crawlers, previewers, monitors and headless browsers. */
const BOT_UA =
  /bot|crawl|spider|slurp|preview|monitor|uptime|lighthouse|pagespeed|headless|phantom|puppeteer|playwright|selenium|curl|wget|python|go-http|java\/|axios|node-fetch|undici|postman|insomnia|scan|facebookexternalhit|whatsapp|telegram|discord|skype/i;

export function isBot(userAgent: string | null): boolean {
  return !userAgent || userAgent.length < 20 || BOT_UA.test(userAgent);
}

/** True when the request carries Global Privacy Control or Do Not Track. */
export function optedOutByHeader(headers: Headers): boolean {
  return headers.get("sec-gpc") === "1" || headers.get("dnt") === "1";
}

export type Increment = { metric: Metric; field: string };
export type Metric = "pv" | "entry" | "camp" | "dev" | "ev" | "inq";

/** Fields per day each metric may hold before new values fold into "(other)". */
export const METRIC_CAPS: Record<Metric, number> = { pv: 200, entry: 300, camp: 100, dev: 10, ev: 50, inq: 500 };

/**
 * Validates a beacon and returns the counters it increments, or null when
 * it is malformed. Unknown pages and events are counted as "other" or
 * dropped; nothing outside the vocabulary is stored verbatim.
 */
export function incrementsFor(raw: unknown): Increment[] | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  const b = raw as Partial<Beacon> & Record<string, unknown>;
  if (typeof b.p !== "string" || b.p.length > 300 || !b.p.startsWith("/")) return null;
  const page = pageFromPath(b.p);

  if (b.k === "pv") {
    const out: Increment[] = [
      { metric: "pv", field: `${page.key}|${page.locale}` },
      { metric: "dev", field: deviceFor(b.w) },
    ];
    if (b.e === 1) {
      const host = referrerHost(b.r);
      const source = token(b.us);
      const medium = token(b.um);
      const channel = channelFor(host, source, medium);
      out.push({ metric: "entry", field: `${channel}|${source || host || "-"}|${page.locale}` });
      const campaign = token(b.uc);
      if (campaign) out.push({ metric: "camp", field: `${campaign}|${source || "-"}` });
    }
    return out;
  }

  if (b.k === "ev") {
    if (typeof b.n !== "string" || !(b.n in EVENTS)) return null;
    const name = b.n as EventName;
    const allowed: readonly string[] = EVENTS[name];
    const detail = typeof b.d === "string" && allowed.includes(b.d) ? b.d : "-";
    return [{ metric: "ev", field: `${name}|${detail}|${page.key}|${page.locale}` }];
  }
  return null;
}

/** Calendar day in the clinic's time zone (Batesville, Arkansas). */
export const CLINIC_TIME_ZONE = "America/Chicago";

export function dayKey(at: number | Date, timeZone = CLINIC_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

/** The `count` calendar days ending with `last` (inclusive), oldest first. */
export function dayRange(last: string, count: number): string[] {
  const [y, m, d] = last.split("-").map(Number) as [number, number, number];
  const end = Date.UTC(y, m - 1, d);
  return Array.from({ length: count }, (_, i) => new Date(end - (count - 1 - i) * 86_400_000).toISOString().slice(0, 10));
}
