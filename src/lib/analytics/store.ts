import { sharedStoreConfig } from "@/lib/security/rateLimit";
import { METRIC_CAPS, type Increment, type Metric } from "./normalize";

/**
 * Daily aggregate counters: one hash per (day, metric), field → count.
 * Nothing per-visit is ever written.
 */

export type DayCounts = Record<Metric, Record<string, number>>;
export type DayData = { day: string; counts: DayCounts };

export const METRICS: Metric[] = ["pv", "entry", "camp", "dev", "ev", "inq"];
export const OTHER_FIELD = "(other)";
/** Kept for 13 months, so a year can be compared with the one before. */
export const RETENTION_SECONDS = 400 * 86_400;

export interface AnalyticsStore {
  readonly kind: "shared" | "memory";
  record(day: string, increments: Increment[]): Promise<void>;
  read(days: string[]): Promise<DayData[]>;
}

const emptyCounts = (): DayCounts => ({ pv: {}, entry: {}, camp: {}, dev: {}, ev: {}, inq: {} });

/** Per-process store: development, tests, and single-server hosting. */
export class MemoryAnalyticsStore implements AnalyticsStore {
  readonly kind = "memory" as const;
  private readonly data = new Map<string, DayCounts>();

  async record(day: string, increments: Increment[]): Promise<void> {
    const counts = this.data.get(day) ?? emptyCounts();
    this.data.set(day, counts);
    for (const { metric, field } of increments) {
      const hash = counts[metric];
      const key = field in hash || Object.keys(hash).length < METRIC_CAPS[metric] ? field : OTHER_FIELD;
      hash[key] = (hash[key] ?? 0) + 1;
    }
    // Bounded like the shared store: forget days past retention.
    if (this.data.size > 400) {
      const oldest = [...this.data.keys()].sort()[0];
      if (oldest) this.data.delete(oldest);
    }
  }

  async read(days: string[]): Promise<DayData[]> {
    return days.map((day) => ({ day, counts: structuredClone(this.data.get(day) ?? emptyCounts()) }));
  }
}

type Fetch = typeof fetch;

/**
 * Increments a field unless the hash is full, in which case the count goes
 * to "(other)". Atomic, so concurrent beacons can't push a day past its cap.
 */
const CAPPED_HINCRBY = `
local f = ARGV[1]
if redis.call('HEXISTS', KEYS[1], f) == 0 and redis.call('HLEN', KEYS[1]) >= tonumber(ARGV[2]) then f = ARGV[4] end
redis.call('HINCRBY', KEYS[1], f, 1)
redis.call('EXPIRE', KEYS[1], ARGV[3])
return 1`;

/** Shared counters in Upstash Redis (the same database as rate limiting). */
export class UpstashAnalyticsStore implements AnalyticsStore {
  readonly kind = "shared" as const;
  private readonly url: string;

  constructor(
    url: string,
    private readonly token: string,
    private readonly fetchImpl: Fetch = fetch,
    private readonly timeoutMs = 2000,
  ) {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") throw new Error("Upstash REST URL must use https");
    this.url = parsed.origin;
  }

  static key(day: string, metric: Metric): string {
    return `stars:an:${day}:${metric}`;
  }

  private async send(endpoint: "pipeline" | "multi-exec", commands: string[][]): Promise<unknown[]> {
    const res = await this.fetchImpl(`${this.url}/${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(this.timeoutMs),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash responded ${res.status}`);
    const body: unknown = await res.json();
    if (!Array.isArray(body) || body.length !== commands.length) throw new Error("Unexpected Upstash response");
    return body.map((entry) => {
      if (typeof entry !== "object" || entry === null || "error" in entry) {
        throw new Error(`Upstash command failed: ${String((entry as { error?: unknown } | null)?.error ?? "malformed")}`);
      }
      return (entry as { result?: unknown }).result;
    });
  }

  async record(day: string, increments: Increment[]): Promise<void> {
    if (increments.length === 0) return;
    await this.send(
      "multi-exec",
      increments.map(({ metric, field }) => [
        "EVAL",
        CAPPED_HINCRBY,
        "1",
        UpstashAnalyticsStore.key(day, metric),
        field,
        String(METRIC_CAPS[metric]),
        String(RETENTION_SECONDS),
        OTHER_FIELD,
      ]),
    );
  }

  async read(days: string[]): Promise<DayData[]> {
    if (days.length === 0) return [];
    const commands = days.flatMap((day) => METRICS.map((metric) => ["HGETALL", UpstashAnalyticsStore.key(day, metric)]));
    const results = await this.send("pipeline", commands);
    return days.map((day, d) => {
      const counts = emptyCounts();
      METRICS.forEach((metric, m) => {
        const flat = results[d * METRICS.length + m];
        if (!Array.isArray(flat)) return;
        for (let i = 0; i + 1 < flat.length; i += 2) {
          const n = Number(flat[i + 1]);
          if (typeof flat[i] === "string" && Number.isFinite(n)) counts[metric][flat[i] as string] = n;
        }
      });
      return { day, counts };
    });
  }
}

/** Shared store when Upstash is configured, per-process memory otherwise. */
export function createAnalyticsStore(env: NodeJS.ProcessEnv = process.env, fetchImpl: Fetch = fetch): AnalyticsStore {
  const config = sharedStoreConfig(env);
  return config ? new UpstashAnalyticsStore(config.url, config.token, fetchImpl) : new MemoryAnalyticsStore();
}

/** Analytics is on unless ANALYTICS_ENABLED is explicitly "false". */
export const analyticsEnabled = (env: NodeJS.ProcessEnv = process.env): boolean => env.ANALYTICS_ENABLED !== "false";

const STORE_KEY = Symbol.for("stars.analytics.store");
type WithStore = typeof globalThis & { [STORE_KEY]?: AnalyticsStore };

/**
 * Process-wide store, shared by the collector, the inquiry handler and the
 * dashboard. Held on `globalThis` because Next.js bundles pages and route
 * handlers separately: a module-level variable would give the dashboard its
 * own (empty) memory store.
 */
export function analyticsStore(): AnalyticsStore {
  const g = globalThis as WithStore;
  g[STORE_KEY] ??= createAnalyticsStore();
  return g[STORE_KEY];
}
