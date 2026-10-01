import { createInquiryHandler } from "@/lib/inquiry/handler";
import { MemoryRateLimitStore } from "@/lib/security/rateLimit";
import type { deliverInquiry } from "@/lib/inquiry/deliver";
import type { AlertSender } from "@/lib/observability/alert";

const NOW = 1_000_000;
const body = {
  audience: "family",
  reason: "tour",
  name: "Jordan Parker",
  phone: "870-555-0134",
  preferredContact: "phone",
  consent: true,
  website: "",
  startedAt: NOW - 10_000,
};

const silent = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function setup(opts: { env?: Record<string, string>; deliver?: typeof deliverInquiry } = {}) {
  const deliver = opts.deliver ?? vi.fn(async () => ({ ok: true as const, channels: ["email" as const] }));
  const alert = vi.fn<AlertSender>(async () => "sent");
  const handler = createInquiryHandler({
    env: { NODE_ENV: "production", RATE_LIMIT_MAX: "3", ...opts.env } as unknown as NodeJS.ProcessEnv,
    store: new MemoryRateLimitStore(),
    deliver,
    now: () => NOW,
    logger: silent,
    alert,
  });
  return { handler, deliver, alert };
}

const post = (data: unknown, headers: Record<string, string> = {}) =>
  new Request("https://stars.test/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.1", ...headers },
    body: typeof data === "string" ? data : JSON.stringify(data),
  });

describe("POST /api/inquiry", () => {
  it("delivers a valid inquiry", async () => {
    const { handler, deliver } = setup();
    const res = await handler(post(body));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(deliver).toHaveBeenCalledOnce();
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects cross-origin requests", async () => {
    const { handler } = setup();
    const res = await handler(post(body, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });

  it("rejects non-JSON content types", async () => {
    const { handler } = setup();
    const res = await handler(post(body, { "content-type": "text/plain" }));
    expect(res.status).toBe(415);
  });

  it("rejects malformed JSON and non-object bodies", async () => {
    const { handler } = setup();
    expect((await handler(post("{nope"))).status).toBe(400);
    expect((await handler(post("[1,2]"))).status).toBe(400);
  });

  it("rejects oversized bodies", async () => {
    const { handler } = setup();
    const res = await handler(post({ ...body, message: "x".repeat(20_000) }));
    expect(res.status).toBe(413);
  });

  it("returns field errors for invalid input", async () => {
    const { handler, deliver } = setup();
    const res = await handler(post({ ...body, name: "", consent: false }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.fieldErrors).toHaveProperty("name");
    expect(json.fieldErrors).toHaveProperty("consent");
    expect(deliver).not.toHaveBeenCalled();
  });

  it("silently accepts but drops honeypot and too-fast submissions", async () => {
    const { handler, deliver } = setup();
    expect((await handler(post({ ...body, website: "http://spam" }))).status).toBe(200);
    expect((await handler(post({ ...body, startedAt: NOW - 500 }))).status).toBe(200);
    expect(deliver).not.toHaveBeenCalled();
  });

  it("rate limits per IP", async () => {
    const { handler } = setup();
    for (let i = 0; i < 3; i += 1) expect((await handler(post(body))).status).toBe(200);
    const blocked = await handler(post(body));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
    expect((await handler(post(body, { "x-forwarded-for": "198.51.100.7" }))).status).toBe(200);
  });

  it("returns 503 with the phone number in production when delivery isn't configured", async () => {
    const { handler, alert } = setup({ deliver: vi.fn(async () => ({ ok: false as const, reason: "not-configured" as const })) });
    const res = await handler(post(body));
    expect(res.status).toBe(503);
    expect((await res.json()).error).toContain("870-793-3200");
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ fingerprint: "inquiry:not-configured", severity: "critical" }));
  });

  it("accepts without delivery in development", async () => {
    const { handler, alert } = setup({
      env: { NODE_ENV: "development" },
      deliver: vi.fn(async () => ({ ok: false as const, reason: "not-configured" as const })),
    });
    expect((await handler(post(body))).status).toBe(200);
    expect(alert).not.toHaveBeenCalled();
  });

  it("returns 502 when delivery fails", async () => {
    const { handler, alert } = setup({ deliver: vi.fn(async () => ({ ok: false as const, reason: "failed" as const, detail: "x" })) });
    expect((await handler(post(body))).status).toBe(502);
    const sent = alert.mock.calls[0]?.[0];
    expect(sent?.fingerprint).toBe("inquiry:delivery-failed");
    // The alert names the request type, never the family's details.
    expect(JSON.stringify(sent)).not.toMatch(/Jordan|870-555/);
  });
});
