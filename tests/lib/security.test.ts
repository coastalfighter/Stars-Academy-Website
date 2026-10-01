import { checkRateLimit, clientIp, MemoryRateLimitStore } from "@/lib/security/rateLimit";
import { allowedOrigins, isAllowedOrigin } from "@/lib/security/origin";

describe("rate limiter", () => {
  it("allows up to max hits per window, then blocks with retry-after", async () => {
    const store = new MemoryRateLimitStore();
    const opts = { max: 2, windowMs: 60_000 };
    expect((await checkRateLimit(store, "ip", { ...opts, now: 0 })).allowed).toBe(true);
    expect((await checkRateLimit(store, "ip", { ...opts, now: 1000 })).allowed).toBe(true);
    const blocked = await checkRateLimit(store, "ip", { ...opts, now: 2000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(58);
  });

  it("frees capacity after the window slides", async () => {
    const store = new MemoryRateLimitStore();
    const opts = { max: 1, windowMs: 1000 };
    await checkRateLimit(store, "ip", { ...opts, now: 0 });
    expect((await checkRateLimit(store, "ip", { ...opts, now: 500 })).allowed).toBe(false);
    expect((await checkRateLimit(store, "ip", { ...opts, now: 2600 })).allowed).toBe(true);
  });

  it("keeps separate buckets per key", async () => {
    const store = new MemoryRateLimitStore();
    const opts = { max: 1, windowMs: 1000, now: 0 };
    await checkRateLimit(store, "a", opts);
    expect((await checkRateLimit(store, "b", opts)).allowed).toBe(true);
  });

  it("reads the client IP from proxy headers", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe("203.0.113.9");
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});

describe("origin guard", () => {
  const env = { NEXT_PUBLIC_SITE_URL: "https://www.stars.test", ALLOWED_ORIGINS: "https://preview.stars.test, not a url" } as unknown as NodeJS.ProcessEnv;
  const req = (origin?: string) =>
    new Request("https://app.internal/api/inquiry", { method: "POST", headers: origin ? { origin } : {} });

  it("parses configured origins and ignores malformed entries", () => {
    expect([...allowedOrigins(env)].sort()).toEqual(["https://preview.stars.test", "https://www.stars.test"]);
  });

  it("allows same-origin, configured origins and origin-less requests", () => {
    expect(isAllowedOrigin(req("https://app.internal"), env)).toBe(true);
    expect(isAllowedOrigin(req("https://www.stars.test"), env)).toBe(true);
    expect(isAllowedOrigin(req(), env)).toBe(true);
  });

  it("rejects foreign origins", () => {
    expect(isAllowedOrigin(req("https://evil.example"), env)).toBe(false);
  });

  const withHost = (origin: string, headers: Record<string, string>) =>
    new Request("http://localhost:3000/api/inquiry", { method: "POST", headers: { origin, ...headers } });

  it("matches the host the visitor requested, even when the server sees another URL", () => {
    expect(isAllowedOrigin(withHost("http://127.0.0.1:3200", { host: "127.0.0.1:3200" }), env)).toBe(true);
    expect(isAllowedOrigin(withHost("https://www.stars.test", { host: "internal:3000", "x-forwarded-host": "www.stars.test" }), env)).toBe(true);
  });

  it("still rejects cross-site posts when Host is the real site", () => {
    expect(isAllowedOrigin(withHost("https://evil.example", { host: "www.stars.test" }), env)).toBe(false);
  });

  it("rejects opaque (null) origins", () => {
    expect(isAllowedOrigin(withHost("null", { host: "www.stars.test" }), env)).toBe(false);
  });
});
