import { createHmac, randomBytes } from "node:crypto";

/**
 * Sliding-window rate limiter.
 *
 * Two stores share one interface:
 *  - `MemoryRateLimitStore`: exact on a single long-lived Node server, and a
 *    best-effort guard on serverless (each instance keeps its own window).
 *  - `UpstashRateLimitStore`: one window shared by every instance, used when
 *    UPSTASH_REDIS_REST_URL / _TOKEN are set, behind a memory failover.
 */

export interface RateLimitStore {
  /** Records a hit for `key` and returns all hit timestamps inside the window. */
  hit(key: string, now: number, windowMs: number): Promise<number[]>;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private readonly hits = new Map<string, number[]>();
  private lastSweep = 0;

  constructor(private readonly maxKeys = 10_000) {}

  async hit(key: string, now: number, windowMs: number): Promise<number[]> {
    this.sweep(now, windowMs);
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    this.hits.set(key, recent);
    return recent;
  }

  private sweep(now: number, windowMs: number): void {
    if (now - this.lastSweep < windowMs && this.hits.size < this.maxKeys) return;
    this.lastSweep = now;
    for (const [key, times] of this.hits) {
      if (times.every((t) => now - t >= windowMs)) this.hits.delete(key);
    }
  }
}

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

export async function checkRateLimit(
  store: RateLimitStore,
  key: string,
  { max, windowMs, now = Date.now() }: { max: number; windowMs: number; now?: number },
): Promise<RateLimitResult> {
  const hits = await store.hit(key, now, windowMs);
  const allowed = hits.length <= max;
  const oldest = hits[0] ?? now;
  return {
    allowed,
    remaining: Math.max(0, max - hits.length),
    retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
  };
}

/** Best-effort client IP from standard proxy headers. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

// ── Shared store (Upstash Redis over REST) ──────────────────────────────────

type Fetch = typeof fetch;
type WarnLogger = { warn: (message: string, fields?: unknown) => void };

/**
 * Sliding window in a Redis sorted set, shared by every server instance, so
 * the limit holds on serverless where each instance has its own memory.
 *
 * Talks to Upstash's REST API directly (no SDK, no TCP) and runs the window
 * update as one MULTI/EXEC transaction. Keys are HMAC-hashed before they
 * leave the server, so visitor IP addresses are never stored at Upstash.
 */
export class UpstashRateLimitStore implements RateLimitStore {
  private readonly url: string;

  constructor(
    url: string,
    private readonly token: string,
    private readonly fetchImpl: Fetch = fetch,
    private readonly timeoutMs = 1500,
    /** Upper bound on remembered hits per key, so a flood can't grow a key without limit. */
    private readonly maxEntries = 100,
  ) {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") throw new Error("Upstash REST URL must use https");
    this.url = parsed.origin;
  }

  hashKey(key: string): string {
    return `stars:rl:${createHmac("sha256", this.token).update(key).digest("hex").slice(0, 32)}`;
  }

  async hit(key: string, now: number, windowMs: number): Promise<number[]> {
    const k = this.hashKey(key);
    const member = `${now}:${randomBytes(6).toString("hex")}`;
    const res = await this.fetchImpl(`${this.url}/multi-exec`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["ZREMRANGEBYSCORE", k, "-inf", String(now - windowMs)],
        ["ZADD", k, String(now), member],
        ["ZREMRANGEBYRANK", k, "0", String(-(this.maxEntries + 1))],
        ["ZRANGE", k, "0", "-1", "WITHSCORES"],
        ["PEXPIRE", k, String(windowMs)],
      ]),
      signal: AbortSignal.timeout(this.timeoutMs),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash responded ${res.status}`);

    const body: unknown = await res.json();
    if (!Array.isArray(body) || body.length !== 5) throw new Error("Unexpected Upstash response");
    const failed = body.find((r) => typeof r !== "object" || r === null || "error" in r);
    if (failed) throw new Error(`Upstash command failed: ${String((failed as { error?: unknown })?.error ?? "malformed")}`);

    const range = (body[3] as { result?: unknown }).result;
    if (!Array.isArray(range)) throw new Error("Unexpected Upstash ZRANGE result");
    const times: number[] = [];
    for (let i = 1; i < range.length; i += 2) {
      const score = Number(range[i]);
      if (Number.isFinite(score)) times.push(score);
    }
    return times.sort((a, b) => a - b);
  }
}

/**
 * Uses the shared store, and falls back to per-instance memory if it is slow
 * or down. A Redis outage must not take the inquiry form down with it: the
 * memory window still limits abuse per instance while the outage lasts.
 */
export class FailoverRateLimitStore implements RateLimitStore {
  private lastWarning = Number.NEGATIVE_INFINITY;

  constructor(
    private readonly primary: RateLimitStore,
    private readonly fallback: RateLimitStore,
    private readonly logger: WarnLogger,
    private readonly warnEveryMs = 60_000,
  ) {}

  async hit(key: string, now: number, windowMs: number): Promise<number[]> {
    try {
      return await this.primary.hit(key, now, windowMs);
    } catch (error) {
      if (now - this.lastWarning >= this.warnEveryMs) {
        this.lastWarning = now;
        this.logger.warn("shared rate-limit store unavailable; using memory", { event: "ratelimit.failover", error });
      }
      return this.fallback.hit(key, now, windowMs);
    }
  }
}

export type RateLimitBackend = "shared" | "memory";

/** Reads Upstash credentials (or Vercel KV's names for the same service). */
export function sharedStoreConfig(env: NodeJS.ProcessEnv = process.env): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    return new URL(url).protocol === "https:" ? { url, token } : null;
  } catch {
    return null;
  }
}

export function rateLimitBackend(env: NodeJS.ProcessEnv = process.env): RateLimitBackend {
  return sharedStoreConfig(env) ? "shared" : "memory";
}

/** The store the API routes use: shared when configured, memory otherwise. */
export function createRateLimitStore(
  env: NodeJS.ProcessEnv = process.env,
  { logger, fetchImpl = fetch }: { logger: WarnLogger; fetchImpl?: Fetch },
): RateLimitStore {
  const config = sharedStoreConfig(env);
  if (!config) return new MemoryRateLimitStore();
  return new FailoverRateLimitStore(new UpstashRateLimitStore(config.url, config.token, fetchImpl), new MemoryRateLimitStore(), logger);
}
