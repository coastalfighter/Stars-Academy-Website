import { MemoryAnalyticsStore, UpstashAnalyticsStore, createAnalyticsStore, analyticsStore, OTHER_FIELD } from "@/lib/analytics/store";
import { METRIC_CAPS } from "@/lib/analytics/normalize";

describe("MemoryAnalyticsStore", () => {
  it("increments daily counters", async () => {
    const store = new MemoryAnalyticsStore();
    await store.record("2026-10-01", [{ metric: "pv", field: "home|en" }, { metric: "pv", field: "home|en" }, { metric: "dev", field: "mobile" }]);
    const [day] = await store.read(["2026-10-01"]);
    expect(day?.counts.pv).toEqual({ "home|en": 2 });
    expect(day?.counts.dev).toEqual({ mobile: 1 });
    expect((await store.read(["2026-09-30"]))[0]?.counts.pv).toEqual({});
  });

  it("folds new values into (other) once a day's metric is full", async () => {
    const store = new MemoryAnalyticsStore();
    const cap = METRIC_CAPS.camp;
    for (let i = 0; i < cap + 5; i++) await store.record("d", [{ metric: "camp", field: `c${i}|-` }]);
    await store.record("d", [{ metric: "camp", field: "c0|-" }]);
    const camp = (await store.read(["d"]))[0]!.counts.camp;
    expect(Object.keys(camp)).toHaveLength(cap + 1);
    expect(camp[OTHER_FIELD]).toBe(5);
    expect(camp["c0|-"]).toBe(2);
  });

  it("returns copies, not live state", async () => {
    const store = new MemoryAnalyticsStore();
    await store.record("d", [{ metric: "dev", field: "mobile" }]);
    (await store.read(["d"]))[0]!.counts.dev.mobile = 99;
    expect((await store.read(["d"]))[0]!.counts.dev.mobile).toBe(1);
  });
});

describe("UpstashAnalyticsStore", () => {
  it("writes capped increments in one transaction and reads with one pipeline", async () => {
    const calls: { url: string; body: string[][] }[] = [];
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as string[][];
      calls.push({ url, body });
      if (url.endsWith("/multi-exec")) return Response.json(body.map(() => ({ result: 1 })));
      return Response.json(body.map(([, key]) => ({ result: key?.endsWith(":pv") ? ["home|en", "3", "faq|es", "1"] : [] })));
    }) as unknown as typeof fetch;
    const store = new UpstashAnalyticsStore("https://x.upstash.io", "tok", fetchImpl);

    await store.record("2026-10-01", [{ metric: "pv", field: "home|en" }]);
    const eval1 = calls[0]!;
    expect(eval1.url).toBe("https://x.upstash.io/multi-exec");
    expect(eval1.body[0]?.slice(0, 1)).toEqual(["EVAL"]);
    expect(eval1.body[0]?.slice(2)).toEqual(["1", "stars:an:2026-10-01:pv", "home|en", "200", String(400 * 86_400), OTHER_FIELD]);

    const days = await store.read(["2026-10-01", "2026-10-02"]);
    expect(calls[1]!.url).toBe("https://x.upstash.io/pipeline");
    expect(calls[1]!.body).toHaveLength(12);
    expect(days[0]!.counts.pv).toEqual({ "home|en": 3, "faq|es": 1 });
  });

  it("surfaces errors to the caller", async () => {
    const failing = vi.fn(async () => Response.json([{ error: "NOSCRIPT" }])) as unknown as typeof fetch;
    await expect(new UpstashAnalyticsStore("https://x.upstash.io", "t", failing).record("d", [{ metric: "dev", field: "mobile" }])).rejects.toThrow(/NOSCRIPT/);
    expect(() => new UpstashAnalyticsStore("http://x.upstash.io", "t")).toThrow(/https/);
  });
});

describe("store selection", () => {
  it("is shared when Upstash is configured", () => {
    expect(createAnalyticsStore({} as NodeJS.ProcessEnv).kind).toBe("memory");
    expect(createAnalyticsStore({ KV_REST_API_URL: "https://x.upstash.io", KV_REST_API_TOKEN: "t" } as unknown as NodeJS.ProcessEnv).kind).toBe("shared");
  });

  it("keeps one process-wide instance across module copies", () => {
    expect(analyticsStore()).toBe(analyticsStore());
    expect((globalThis as Record<symbol, unknown>)[Symbol.for("stars.analytics.store")]).toBe(analyticsStore());
  });
});
