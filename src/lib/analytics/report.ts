import { AUDIENCE_LABELS, HEARD_FROM_LABELS, REASON_LABELS, type Audience, type HeardFrom, type Reason } from "@/lib/validation/inquiry";
import type { Channel, Device, PageKey } from "./normalize";
import { OTHER_FIELD, type DayData } from "./store";

/** Aggregates daily counters into what the insights dashboard shows. */

export type Row = { key: string; label: string; count: number };

export type Totals = {
  visits: number;
  pageviews: number;
  inquiries: number;
  /** Inquiries per 100 visits. */
  inquiryRate: number;
  formStarts: number;
  phone: number;
  email: number;
  directions: number;
};

export type Report = {
  from: string;
  to: string;
  days: number;
  totals: Totals;
  previous: Totals;
  daily: { day: string; visits: number; pageviews: number; inquiries: number }[];
  pages: Row[];
  channels: Row[];
  sources: Row[];
  campaigns: Row[];
  devices: Row[];
  languages: Row[];
  inquiryReasons: Row[];
  inquiryAudiences: Row[];
  heardFrom: Row[];
  inquiryLanguages: Row[];
  interactions: Row[];
};

export const PAGE_LABELS: Record<string, string> = {
  home: "Home",
  services: "Services",
  approach: "Our approach",
  about: "About us",
  gettingStarted: "Getting started",
  families: "Families",
  faq: "FAQ",
  contact: "Contact",
  tour: "Schedule a tour",
  privacy: "Privacy",
  accessibility: "Accessibility",
  nondiscrimination: "Nondiscrimination",
  referrals: "Referrals",
  careers: "Careers",
  apply: "Job application",
  "service:developmental-classrooms": "Service: Developmental classrooms",
  "service:speech-therapy": "Service: Speech therapy",
  "service:occupational-therapy": "Service: Occupational therapy",
  "service:physical-therapy": "Service: Physical therapy",
  "service:nursing-care": "Service: Nursing care",
  other: "Other pages (incl. not found)",
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  direct: "Direct (typed, bookmarks, apps)",
  search: "Search engines",
  social: "Social media",
  email: "Email",
  referral: "Other websites",
  campaign: "Campaigns (tagged links, QR codes)",
};

const DEVICE_LABELS: Record<Device, string> = { mobile: "Phone", tablet: "Tablet", desktop: "Computer" };
const LANGUAGE_LABELS: Record<string, string> = { en: "English", es: "Spanish" };
const INTERACTION_LABELS: Record<string, string> = {
  "phone_click|-": "Tapped the phone number",
  "email_click|-": "Tapped the email address",
  "directions_click|-": "Opened directions",
  "form_start|-": "Started a form",
  "language_switch|es": "Switched to Spanish",
  "language_switch|en": "Switched to English",
  "calm_mode|on": "Turned calm mode on",
  "calm_mode|off": "Turned calm mode off",
};

const labelOr = (map: Record<string, string>, key: string) => map[key] ?? (key === OTHER_FIELD || key === "-" ? "Other / not given" : key);

/** Sums counts by a key derived from each field, sorted high → low. */
function rollup(
  days: DayData[],
  metric: keyof DayData["counts"],
  keyOf: (parts: string[]) => string | null,
  label: (key: string) => string,
): Row[] {
  const sums = new Map<string, number>();
  for (const { counts } of days) {
    for (const [field, n] of Object.entries(counts[metric])) {
      const key = keyOf(field.split("|"));
      if (key !== null) sums.set(key, (sums.get(key) ?? 0) + n);
    }
  }
  return [...sums.entries()]
    .map(([key, count]) => ({ key, label: label(key), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

const sum = (rec: Record<string, number>, pick: (parts: string[]) => boolean = () => true) =>
  Object.entries(rec).reduce((t, [f, n]) => (pick(f.split("|")) ? t + n : t), 0);

function totalsFor(days: DayData[]): Totals {
  let visits = 0;
  let pageviews = 0;
  let inquiries = 0;
  let formStarts = 0;
  let phone = 0;
  let email = 0;
  let directions = 0;
  for (const { counts } of days) {
    visits += sum(counts.entry);
    pageviews += sum(counts.pv);
    inquiries += sum(counts.inq);
    formStarts += sum(counts.ev, (p) => p[0] === "form_start");
    phone += sum(counts.ev, (p) => p[0] === "phone_click");
    email += sum(counts.ev, (p) => p[0] === "email_click");
    directions += sum(counts.ev, (p) => p[0] === "directions_click");
  }
  return {
    visits,
    pageviews,
    inquiries,
    inquiryRate: visits > 0 ? Math.round((inquiries / visits) * 1000) / 10 : 0,
    formStarts,
    phone,
    email,
    directions,
  };
}

/** `current` and `previous` are equal-length runs of consecutive days, oldest first. */
export function buildReport(current: DayData[], previous: DayData[]): Report {
  return {
    from: current[0]?.day ?? "",
    to: current.at(-1)?.day ?? "",
    days: current.length,
    totals: totalsFor(current),
    previous: totalsFor(previous),
    daily: current.map(({ day, counts }) => ({ day, visits: sum(counts.entry), pageviews: sum(counts.pv), inquiries: sum(counts.inq) })),
    pages: rollup(current, "pv", (p) => p[0] ?? null, (k) => labelOr(PAGE_LABELS, k as PageKey)),
    channels: rollup(current, "entry", (p) => p[0] ?? null, (k) => labelOr(CHANNEL_LABELS, k)),
    sources: rollup(current, "entry", (p) => (p[1] && p[1] !== "-" ? p[1] : null), (k) => labelOr({}, k)).slice(0, 15),
    campaigns: rollup(current, "camp", (p) => (p[0] ? `${p[0]}${p[1] && p[1] !== "-" ? ` (${p[1]})` : ""}` : null), (k) => k).slice(0, 15),
    devices: rollup(current, "dev", (p) => p[0] ?? null, (k) => labelOr(DEVICE_LABELS, k)),
    languages: rollup(current, "pv", (p) => p[1] ?? null, (k) => labelOr(LANGUAGE_LABELS, k)),
    inquiryReasons: rollup(current, "inq", (p) => p[0] ?? null, (k) => labelOr(REASON_LABELS, k as Reason)),
    inquiryAudiences: rollup(current, "inq", (p) => p[1] ?? null, (k) => labelOr(AUDIENCE_LABELS, k as Audience)),
    heardFrom: rollup(current, "inq", (p) => p[2] ?? null, (k) => labelOr(HEARD_FROM_LABELS, k as HeardFrom)),
    inquiryLanguages: rollup(current, "inq", (p) => p[3] ?? null, (k) => labelOr(LANGUAGE_LABELS, k)),
    interactions: rollup(current, "ev", (p) => (p[0] ? `${p[0]}|${p[1] ?? "-"}` : null), (k) => labelOr(INTERACTION_LABELS, k)),
  };
}

const csvCell = (v: string | number) => {
  const s = String(v);
  // Quote when needed, and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** Long-format CSV: one row per (section, item) plus the daily series. */
export function reportCsv(report: Report): string {
  const rows: (string | number)[][] = [["section", "item", "value"]];
  for (const [k, v] of Object.entries(report.totals)) rows.push(["total", k, v]);
  for (const d of report.daily) {
    rows.push(["daily visits", d.day, d.visits], ["daily page views", d.day, d.pageviews], ["daily inquiries", d.day, d.inquiries]);
  }
  const sections: [string, Row[]][] = [
    ["page views", report.pages],
    ["visits by channel", report.channels],
    ["visits by source", report.sources],
    ["campaigns", report.campaigns],
    ["devices", report.devices],
    ["page views by language", report.languages],
    ["inquiries by request", report.inquiryReasons],
    ["inquiries by sender", report.inquiryAudiences],
    ["inquiries by how they heard", report.heardFrom],
    ["inquiries by language", report.inquiryLanguages],
    ["interactions", report.interactions],
  ];
  for (const [section, list] of sections) for (const r of list) rows.push([section, r.label, r.count]);
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
