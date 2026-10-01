import { dayKey, dayRange } from "./normalize";
import { buildReport, type Report } from "./report";
import { analyticsStore, type AnalyticsStore } from "./store";

export const RANGES = [7, 30, 90] as const;
export type RangeDays = (typeof RANGES)[number];

export function parseRange(raw: unknown): RangeDays {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return (RANGES as readonly number[]).includes(n) ? (n as RangeDays) : 30;
}

/** The last `days` days (today included) plus the same span before, for comparison. */
export async function loadReport(days: RangeDays, { store = analyticsStore(), now = Date.now() }: { store?: AnalyticsStore; now?: number } = {}): Promise<Report> {
  const all = await store.read(dayRange(dayKey(now), days * 2));
  return buildReport(all.slice(days), all.slice(0, days));
}
