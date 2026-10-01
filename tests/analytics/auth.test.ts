import { createSession, insightsConfig, passwordMatches, sessionCookie, sessionFromRequest, verifySession, isHttps } from "@/lib/analytics/auth";
import { createExportHandler, createLoginHandler, createLogoutHandler } from "@/lib/analytics/insightsHandlers";
import { MemoryAnalyticsStore } from "@/lib/analytics/store";
import { createLogger } from "@/lib/observability/logger";
import { MemoryRateLimitStore } from "@/lib/security/rateLimit";

const ENV = { INSIGHTS_PASSWORD: "correct-horse-battery", INSIGHTS_SESSION_SECRET: "s".repeat(32) } as unknown as NodeJS.ProcessEnv;
const config = insightsConfig(ENV)!;
const NOW = 1_800_000_000_000;

describe("insights sessions", () => {
  it("requires a strong password and secret", () => {
    expect(insightsConfig({} as NodeJS.ProcessEnv)).toBeNull();
    expect(insightsConfig({ INSIGHTS_PASSWORD: "short", INSIGHTS_SESSION_SECRET: "s".repeat(32) } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(config).not.toBeNull();
  });

  it("checks the password", () => {
    expect(passwordMatches(config, "correct-horse-battery")).toBe(true);
    expect(passwordMatches(config, "correct-horse-batter")).toBe(false);
  });

  it("issues signed sessions that expire after 12 hours", () => {
    const token = createSession(config, NOW);
    expect(verifySession(config, token, NOW + 60_000)).toBe(true);
    expect(verifySession(config, token, NOW + 12 * 3600_000 + 1000)).toBe(false);
  });

  it("rejects tampering, other secrets and changed passwords", () => {
    const token = createSession(config, NOW);
    const [exp, sig] = token.split(".");
    expect(verifySession(config, `${Number(exp) + 3600}.${sig}`, NOW)).toBe(false);
    expect(verifySession({ ...config, secret: "t".repeat(32) }, token, NOW)).toBe(false);
    expect(verifySession({ ...config, password: "a-new-password-123" }, token, NOW)).toBe(false);
    expect(verifySession(config, "garbage", NOW)).toBe(false);
    expect(verifySession(null, token, NOW)).toBe(false);
  });

  it("builds a locked-down cookie", () => {
    const cookie = sessionCookie("v", { secure: true });
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Secure");
    expect(sessionCookie("v", { secure: false })).not.toContain("Secure");
    expect(sessionFromRequest(new Request("https://x.test", { headers: { cookie: "a=1; stars_insights=abc.def" } }))).toBe("abc.def");
    expect(isHttps(new Request("http://x.test", { headers: { "x-forwarded-proto": "https" } }))).toBe(true);
  });
});

const silent = createLogger({ sink: () => undefined });
const form = (password: string, headers: Record<string, string> = {}) =>
  new Request("https://stars.test/api/insights/login", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", origin: "https://stars.test", "x-forwarded-for": "198.51.100.2", ...headers },
    body: new URLSearchParams({ password }).toString(),
  });

describe("POST /api/insights/login", () => {
  const login = () => createLoginHandler({ env: ENV, logger: silent, rateStore: new MemoryRateLimitStore(), now: () => NOW });

  it("signs staff in with a session cookie", async () => {
    const res = await login()(form("correct-horse-battery"));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/admin/insights");
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^stars_insights=\d+\.[\w-]{43}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=43200; Secure$/);
  });

  it("rejects wrong passwords, cross-site posts, and stops guessing after 10 tries", async () => {
    const handler = login();
    expect((await handler(form("nope"))).headers.get("location")).toBe("/admin/login?error=1");
    expect((await handler(form("correct-horse-battery", { origin: "https://evil.test" }))).status).toBe(403);
    for (let i = 0; i < 9; i++) await handler(form("nope"));
    const limited = await handler(form("correct-horse-battery"));
    expect(limited.headers.get("location")).toBe("/admin/login?error=rate");
    expect(limited.headers.get("set-cookie")).toBeNull();
  });

  it("explains when sign-in isn't configured", async () => {
    const res = await createLoginHandler({ env: {} as NodeJS.ProcessEnv, logger: silent, rateStore: new MemoryRateLimitStore() })(form("x"));
    expect(res.headers.get("location")).toBe("/admin/login?error=config");
  });

  it("signs out by clearing the cookie", async () => {
    const res = createLogoutHandler({ env: ENV })(new Request("https://stars.test/api/insights/logout", { method: "POST", headers: { origin: "https://stars.test" } }));
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});

describe("GET /api/insights/export", () => {
  it("requires a session and returns CSV", async () => {
    const store = new MemoryAnalyticsStore();
    const handler = createExportHandler({ env: ENV, store, now: () => NOW });
    expect((await handler(new Request("https://stars.test/api/insights/export"))).status).toBe(401);
    const res = await handler(new Request("https://stars.test/api/insights/export?range=7", { headers: { cookie: `stars_insights=${createSession(config, NOW)}` } }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(res.headers.get("content-disposition")).toMatch(/attachment; filename="stars-website-insights-.+\.csv"/);
    expect(await res.text()).toMatch(/^section,item,value/);
  });
});
