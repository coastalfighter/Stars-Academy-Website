import { createCollectHandler } from "@/lib/analytics/collect";
import { MemoryAnalyticsStore } from "@/lib/analytics/store";
import { createLogger } from "@/lib/observability/logger";
import { MemoryRateLimitStore } from "@/lib/security/rateLimit";

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1";
const NOW = Date.UTC(2026, 9, 1, 15);

function setup(env: Record<string, string> = {}) {
  const store = new MemoryAnalyticsStore();
  const handler = createCollectHandler({
    env: env as unknown as NodeJS.ProcessEnv,
    store,
    logger: createLogger({ sink: () => undefined }),
    rateStore: new MemoryRateLimitStore(),
    now: () => NOW,
    max: 3,
  });
  const counts = async () => (await store.read(["2026-10-01"]))[0]!.counts;
  return { handler, counts, store };
}

const post = (data: unknown, headers: Record<string, string> = {}) =>
  new Request("https://stars.test/api/collect", {
    method: "POST",
    headers: { "content-type": "text/plain;charset=UTF-8", origin: "https://stars.test", "user-agent": UA, "x-forwarded-for": "203.0.113.4", ...headers },
    body: typeof data === "string" ? data : JSON.stringify(data),
  });

describe("POST /api/collect", () => {
  it("counts a valid beacon on the clinic's calendar day", async () => {
    const { handler, counts } = setup();
    expect((await handler(post({ k: "pv", p: "/faq", w: 390, e: 1 }))).status).toBe(204);
    expect((await counts()).pv).toEqual({ "faq|en": 1 });
    expect((await counts()).entry).toEqual({ "direct|-|en": 1 });
  });

  it("silently ignores bots, GPC, DNT and malformed beacons", async () => {
    const { handler, counts } = setup();
    expect((await handler(post({ k: "pv", p: "/", w: 1 }, { "user-agent": "Googlebot/2.1" }))).status).toBe(204);
    expect((await handler(post({ k: "pv", p: "/", w: 1 }, { "sec-gpc": "1" }))).status).toBe(204);
    expect((await handler(post("{nope"))).status).toBe(204);
    expect((await counts()).pv).toEqual({});
  });

  it("does nothing when analytics is switched off", async () => {
    const { handler, counts } = setup({ ANALYTICS_ENABLED: "false" });
    await handler(post({ k: "pv", p: "/", w: 1 }));
    expect((await counts()).pv).toEqual({});
  });

  it("rejects cross-site, wrong types, oversize bodies and floods", async () => {
    const { handler } = setup();
    expect((await handler(post({ k: "pv", p: "/" }, { origin: "https://evil.test" }))).status).toBe(403);
    expect((await handler(post({ k: "pv", p: "/" }, { "content-type": "application/x-www-form-urlencoded" }))).status).toBe(415);
    expect((await handler(post("x".repeat(5000)))).status).toBe(413);
    // Three requests per window are allowed (max: 3); the 413 above was the first.
    await handler(post({ k: "pv", p: "/" }));
    await handler(post({ k: "pv", p: "/" }));
    expect((await handler(post({ k: "pv", p: "/" }))).status).toBe(429);
  });

  it("never fails the request when storage is down", async () => {
    const handler = createCollectHandler({
      env: {} as NodeJS.ProcessEnv,
      store: { kind: "shared", record: () => Promise.reject(new Error("down")), read: async () => [] },
      logger: createLogger({ sink: () => undefined }),
      rateStore: new MemoryRateLimitStore(),
    });
    expect((await handler(post({ k: "pv", p: "/", w: 1 }))).status).toBe(204);
  });
});
