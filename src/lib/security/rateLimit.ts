/**
 * Sliding-window rate limiter.
 *
 * The default store is in-memory, which is correct for a single long-lived
 * Node server and is a best-effort guard on serverless (each instance keeps
 * its own window). The `RateLimitStore` interface lets a shared store such as
 * Redis be dropped in without touching the route handler.
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
