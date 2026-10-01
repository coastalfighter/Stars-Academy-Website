import { runChecks, summarize } from "../../scripts/uptime-check.mjs";

const healthy: Record<string, () => Response> = {
  "/api/health": () => Response.json({ status: "ok", checks: {} }),
  "/": () => new Response("<html lang=\"en-US\">STARS Academy</html>"),
  "/es": () => new Response("<html lang=\"es-US\">STARS Academy</html>"),
};

function fakeFetch(routes: Record<string, () => Response | Promise<Response>>) {
  return vi.fn(async (url: string) => {
    const handler = routes[new URL(url).pathname];
    if (!handler) return new Response("", { status: 404 });
    return handler();
  }) as unknown as typeof fetch;
}

const fast = { attempts: 2, retryDelayMs: 0 };

describe("uptime check", () => {
  it("passes when every page answers correctly", async () => {
    const results = await runChecks("https://stars.test", { ...fast, fetchImpl: fakeFetch(healthy) });
    expect(results.every((r) => r.ok)).toBe(true);
    expect(summarize(results)).toMatch(/^✅ health: 200/);
  });

  it("fails on a degraded health check, naming the reason", async () => {
    const results = await runChecks("https://stars.test", {
      ...fast,
      fetchImpl: fakeFetch({ ...healthy, "/api/health": () => Response.json({ status: "degraded", checks: { inquiryDelivery: "missing" } }, { status: 503 }) }),
    });
    expect(results[0]).toMatchObject({ ok: false, problem: "HTTP 503" });
  });

  it("retries before failing, so one blip doesn't alarm", async () => {
    let calls = 0;
    const flaky = fakeFetch({ ...healthy, "/": () => (++calls === 1 ? Promise.reject(new Error("ECONNRESET")) : healthy["/"]!()) });
    const results = await runChecks("https://stars.test", { ...fast, fetchImpl: flaky });
    expect(results[1]).toMatchObject({ ok: true });
  });

  it("detects a wrong page served with 200 and refuses insecure targets", async () => {
    const results = await runChecks("https://stars.test", { ...fast, fetchImpl: fakeFetch({ ...healthy, "/es": () => new Response("<html lang=\"en-US\">") }) });
    expect(results[2]).toMatchObject({ ok: false, problem: "page content missing" });
    await expect(runChecks("http://stars.test", fast)).rejects.toThrow(/https/);
  });
});
