import { createHmac } from "node:crypto";
import { createAlertSender, type Alert } from "@/lib/observability/alert";
import { createLogger } from "@/lib/observability/logger";

const silent = createLogger({ sink: () => undefined });
const alert: Alert = { fingerprint: "server-error:/x", severity: "critical", title: "Server error on /x", details: { email: "a@b.co", path: "/x" } };

function setup(env: Record<string, string>, ok = true) {
  let t = 1_000_000;
  const fetchImpl = vi.fn(async () => new Response(null, { status: ok ? 200 : 500 }));
  const send = createAlertSender({
    env: env as unknown as NodeJS.ProcessEnv,
    fetchImpl: fetchImpl as unknown as typeof fetch,
    now: () => t,
    logger: silent,
  });
  return { send, fetchImpl, advance: (ms: number) => (t += ms) };
}

describe("alerts", () => {
  it("is a no-op without ALERT_WEBHOOK_URL", async () => {
    const { send, fetchImpl } = setup({});
    expect(await send(alert)).toBe("disabled");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts a Slack-compatible, redacted, signed body", async () => {
    const { send, fetchImpl } = setup({ ALERT_WEBHOOK_URL: "https://hooks.test/x", ALERT_WEBHOOK_SECRET: "s3cret", VERCEL_ENV: "production" });
    expect(await send(alert)).toBe("sent");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hooks.test/x");
    const body = init.body as string;
    const parsed = JSON.parse(body) as { text: string; event: { details: Record<string, unknown> } };
    expect(parsed.text).toContain("[STARS website · production] Server error on /x");
    expect(parsed.event.details).toEqual({ email: "[redacted]", path: "/x" });
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Stars-Signature"]).toBe(createHmac("sha256", "s3cret").update(body).digest("hex"));
  });

  it("sends one alert per fingerprint per 15 minutes", async () => {
    const { send, fetchImpl, advance } = setup({ ALERT_WEBHOOK_URL: "https://hooks.test/x" });
    expect(await send(alert)).toBe("sent");
    expect(await send(alert)).toBe("throttled");
    expect(await send({ ...alert, fingerprint: "other" })).toBe("sent");
    advance(15 * 60 * 1000);
    expect(await send(alert)).toBe("sent");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("caps the hourly volume", async () => {
    const { send } = setup({ ALERT_WEBHOOK_URL: "https://hooks.test/x" });
    const results = await Promise.all(Array.from({ length: 25 }, (_, i) => send({ ...alert, fingerprint: `f${i}` })));
    expect(results.filter((r) => r === "sent")).toHaveLength(20);
  });

  it("never throws, and retries a failed fingerprint next time", async () => {
    const { send, fetchImpl } = setup({ ALERT_WEBHOOK_URL: "https://hooks.test/x" }, false);
    expect(await send(alert)).toBe("failed");
    expect(await send(alert)).toBe("failed");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
