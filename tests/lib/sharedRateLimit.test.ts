import {
  createRateLimitStore,
  FailoverRateLimitStore,
  MemoryRateLimitStore,
  rateLimitBackend,
  UpstashRateLimitStore,
  checkRateLimit,
} from "@/lib/security/rateLimit";

type Command = string[];

/** A tiny in-memory Upstash: executes the sorted-set commands the store sends. */
function fakeUpstash() {
  const sets = new Map<string, Map<string, number>>();
  const requests: { url: string; auth: string | null; commands: Command[] }[] = [];
  const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
    const commands = JSON.parse(init.body as string) as Command[];
    requests.push({ url, auth: new Headers(init.headers).get("authorization"), commands });
    const results = commands.map(([cmd, key, ...args]) => {
      const set = sets.get(key!) ?? new Map<string, number>();
      sets.set(key!, set);
      switch (cmd) {
        case "ZREMRANGEBYSCORE": {
          const maxScore = Number(args[1]);
          for (const [m, s] of set) if (s <= maxScore) set.delete(m);
          return { result: 0 };
        }
        case "ZADD":
          set.set(args[1]!, Number(args[0]));
          return { result: 1 };
        case "ZREMRANGEBYRANK": {
          const keep = -Number(args[1]) - 1;
          const sorted = [...set.entries()].sort((a, b) => a[1] - b[1]);
          for (const [m] of sorted.slice(0, Math.max(0, sorted.length - keep))) set.delete(m);
          return { result: 0 };
        }
        case "ZRANGE":
          return { result: [...set.entries()].sort((a, b) => a[1] - b[1]).flatMap(([m, s]) => [m, String(s)]) };
        case "PEXPIRE":
          return { result: 1 };
        default:
          return { error: `unknown ${cmd}` };
      }
    });
    return Response.json(results);
  });
  return { fetchImpl: fetchImpl as unknown as typeof fetch, requests, sets };
}

describe("UpstashRateLimitStore", () => {
  it("runs one MULTI/EXEC sliding-window transaction per hit", async () => {
    const up = fakeUpstash();
    const store = new UpstashRateLimitStore("https://eu1-x.upstash.io/", "tok", up.fetchImpl);
    const opts = { max: 2, windowMs: 60_000 };
    expect((await checkRateLimit(store, "inquiry:203.0.113.1", { ...opts, now: 1_000 })).allowed).toBe(true);
    expect((await checkRateLimit(store, "inquiry:203.0.113.1", { ...opts, now: 2_000 })).allowed).toBe(true);
    const third = await checkRateLimit(store, "inquiry:203.0.113.1", { ...opts, now: 3_000 });
    expect(third).toEqual({ allowed: false, remaining: 0, retryAfterSeconds: 58 });
    // The window slides: the first hit expires after 60 s.
    expect((await checkRateLimit(store, "inquiry:203.0.113.1", { ...opts, now: 61_500 })).allowed).toBe(false);
    expect((await checkRateLimit(store, "inquiry:203.0.113.1", { ...opts, now: 200_000 })).allowed).toBe(true);

    const req = up.requests[0]!;
    expect(req.url).toBe("https://eu1-x.upstash.io/multi-exec");
    expect(req.auth).toBe("Bearer tok");
    expect(req.commands.map((c) => c[0])).toEqual(["ZREMRANGEBYSCORE", "ZADD", "ZREMRANGEBYRANK", "ZRANGE", "PEXPIRE"]);
  });

  it("never sends the visitor's IP to Upstash", async () => {
    const up = fakeUpstash();
    const store = new UpstashRateLimitStore("https://x.upstash.io", "tok", up.fetchImpl);
    await store.hit("inquiry:203.0.113.1", 1, 1000);
    expect(JSON.stringify(up.requests)).not.toContain("203.0.113.1");
    expect([...up.sets.keys()][0]).toMatch(/^stars:rl:[0-9a-f]{32}$/);
    expect(store.hashKey("a")).not.toBe(new UpstashRateLimitStore("https://x.upstash.io", "other").hashKey("a"));
  });

  it("caps remembered hits per key", async () => {
    const up = fakeUpstash();
    const store = new UpstashRateLimitStore("https://x.upstash.io", "tok", up.fetchImpl, 1500, 5);
    let hits: number[] = [];
    for (let i = 1; i <= 12; i++) hits = await store.hit("k", i, 60_000);
    expect(hits).toEqual([8, 9, 10, 11, 12]);
  });

  it("rejects insecure URLs and surfaces API errors", async () => {
    expect(() => new UpstashRateLimitStore("http://x.upstash.io", "tok")).toThrow(/https/);
    const failing = vi.fn(async () => Response.json([{ error: "WRONGPASS" }, {}, {}, {}, {}])) as unknown as typeof fetch;
    await expect(new UpstashRateLimitStore("https://x.upstash.io", "tok", failing).hit("k", 1, 1000)).rejects.toThrow(/WRONGPASS/);
    const down = vi.fn(async () => new Response("", { status: 503 })) as unknown as typeof fetch;
    await expect(new UpstashRateLimitStore("https://x.upstash.io", "tok", down).hit("k", 1, 1000)).rejects.toThrow(/503/);
  });
});

describe("FailoverRateLimitStore", () => {
  it("falls back to memory when the shared store fails, warning at most once a minute", async () => {
    const warn = vi.fn();
    const broken = { hit: vi.fn(async () => Promise.reject(new Error("timeout"))) };
    const store = new FailoverRateLimitStore(broken, new MemoryRateLimitStore(), { warn });
    expect(await store.hit("k", 1_000, 60_000)).toEqual([1_000]);
    expect(await store.hit("k", 2_000, 60_000)).toEqual([1_000, 2_000]);
    expect(warn).toHaveBeenCalledTimes(1);
    await store.hit("k", 70_000, 60_000);
    expect(warn).toHaveBeenCalledTimes(2);
  });
});

describe("createRateLimitStore", () => {
  const env = (e: Record<string, string>) => e as unknown as NodeJS.ProcessEnv;
  it("uses Upstash (or Vercel KV) credentials when present", () => {
    const logger = { warn: vi.fn() };
    expect(createRateLimitStore(env({}), { logger })).toBeInstanceOf(MemoryRateLimitStore);
    expect(createRateLimitStore(env({ UPSTASH_REDIS_REST_URL: "https://x.upstash.io", UPSTASH_REDIS_REST_TOKEN: "t" }), { logger })).toBeInstanceOf(
      FailoverRateLimitStore,
    );
    expect(rateLimitBackend(env({ KV_REST_API_URL: "https://x.upstash.io", KV_REST_API_TOKEN: "t" }))).toBe("shared");
    expect(rateLimitBackend(env({ UPSTASH_REDIS_REST_URL: "http://x", UPSTASH_REDIS_REST_TOKEN: "t" }))).toBe("memory");
  });
});
