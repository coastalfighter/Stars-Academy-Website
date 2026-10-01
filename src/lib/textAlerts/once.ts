import { sharedStoreConfig } from "@/lib/security/rateLimit";

/**
 * "Do this only once" markers, so a re-published announcement or a retried
 * webhook can never text families twice. Shared through Upstash when
 * configured (SET NX EX), per-process memory otherwise.
 */
export interface OnceStore {
  /** True if the key was newly claimed; false if it was already taken. */
  claim(key: string, ttlSeconds: number): Promise<boolean>;
  /** Gives the key back (after a failed send, so a retry can try again). */
  release(key: string): Promise<void>;
}

export class MemoryOnceStore implements OnceStore {
  private readonly keys = new Map<string, number>();
  constructor(private readonly now: () => number = Date.now) {}

  async claim(key: string, ttlSeconds: number): Promise<boolean> {
    const t = this.now();
    const until = this.keys.get(key);
    if (until !== undefined && until > t) return false;
    this.keys.set(key, t + ttlSeconds * 1000);
    return true;
  }

  async release(key: string): Promise<void> {
    this.keys.delete(key);
  }
}

export class UpstashOnceStore implements OnceStore {
  private readonly url: string;
  constructor(
    url: string,
    private readonly token: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {
    this.url = new URL(url).origin;
  }

  private async command(args: string[]): Promise<unknown> {
    const res = await this.fetchImpl(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash responded ${res.status}`);
    const body = (await res.json()) as { result?: unknown; error?: string };
    if (body.error) throw new Error(`Upstash: ${body.error}`);
    return body.result;
  }

  async claim(key: string, ttlSeconds: number): Promise<boolean> {
    return (await this.command(["SET", `stars:once:${key}`, "1", "NX", "EX", String(ttlSeconds)])) === "OK";
  }

  async release(key: string): Promise<void> {
    await this.command(["DEL", `stars:once:${key}`]);
  }
}

const KEY = Symbol.for("stars.once.store");
type WithStore = typeof globalThis & { [KEY]?: OnceStore };

export function onceStore(env: NodeJS.ProcessEnv = process.env): OnceStore {
  const g = globalThis as WithStore;
  if (!g[KEY]) {
    const config = sharedStoreConfig(env);
    g[KEY] = config ? new UpstashOnceStore(config.url, config.token) : new MemoryOnceStore();
  }
  return g[KEY];
}
