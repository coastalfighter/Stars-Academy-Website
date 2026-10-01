import { signPayload, SIGNATURE_HEADER } from "@/cms/webhook";
import { composeTextAlert, countSegments } from "@/lib/textAlerts/message";
import { MemoryOnceStore, UpstashOnceStore } from "@/lib/textAlerts/once";
import { createTextAlertHandler } from "@/lib/textAlerts/handler";
import { MemoryRateLimitStore } from "@/lib/security/rateLimit";
import { createLogger } from "@/lib/observability/logger";
import type { AlertSender } from "@/lib/observability/alert";

describe("SMS segments", () => {
  it("counts GSM-7 and switches to UCS-2 for characters outside it", () => {
    expect(countSegments("STARS is closed today.")).toMatchObject({ encoding: "GSM-7", segments: 1 });
    expect(countSegments("a".repeat(161))).toMatchObject({ encoding: "GSM-7", segments: 2 });
    expect(countSegments("Precio €5")).toMatchObject({ encoding: "GSM-7", units: 10 });
    expect(countSegments("Está cerrado")).toMatchObject({ encoding: "UCS-2", segments: 1 });
    expect(countSegments("á".repeat(71))).toMatchObject({ encoding: "UCS-2", segments: 2 });
  });

  it("composes a labelled, bilingual message with opt-out wording", () => {
    expect(composeTextAlert({ en: " Closed today   (icy roads). ", es: "Cerrado hoy." })).toBe(
      "STARS Academy: Closed today (icy roads).\nCerrado hoy.\nReply STOP to opt out / STOP para cancelar",
    );
  });
});

describe("once stores", () => {
  it("claims a key once until it expires or is released", async () => {
    let t = 0;
    const store = new MemoryOnceStore(() => t);
    expect(await store.claim("k", 10)).toBe(true);
    expect(await store.claim("k", 10)).toBe(false);
    t = 11_000;
    expect(await store.claim("k", 10)).toBe(true);
    await store.release("k");
    expect(await store.claim("k", 10)).toBe(true);
  });

  it("uses SET NX EX on Upstash", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ result: "OK" })) as unknown as typeof fetch;
    expect(await new UpstashOnceStore("https://x.upstash.io", "t", fetchImpl).claim("abc", 60)).toBe(true);
    const body = JSON.parse((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body).toEqual(["SET", "stars:once:abc", "1", "NX", "EX", "60"]);
  });
});

describe("POST /api/alerts/text", () => {
  const NOW = Date.parse("2026-01-09T11:00:00Z");
  const SECRET = "whsec";
  const closure = {
    id: "ann-1",
    kind: "closure" as const,
    startsAt: "2026-01-09T10:00:00Z",
    endsAt: "2026-01-10T00:00:00Z",
    sendText: true,
    text: { en: "Closed today, Jan 9, due to icy roads.", es: "Cerrado hoy, 9 de enero, por el hielo." },
  };

  function setup({ doc = closure as typeof closure | null, mode = "live", providerOk = true }: { doc?: Partial<typeof closure> | null; mode?: string; providerOk?: boolean } = {}) {
    const provider = vi.fn(async () => new Response(null, { status: providerOk ? 200 : 500 }));
    const alert = vi.fn<AlertSender>(async () => "sent");
    const handler = createTextAlertHandler({
      env: { TEXT_ALERTS_MODE: mode, TEXT_ALERTS_WEBHOOK_SECRET: SECRET, TEXT_ALERTS_PROVIDER_URL: "https://hooks.sms.test/stars", TEXT_ALERTS_PROVIDER_SECRET: "psec" } as unknown as NodeJS.ProcessEnv,
      config: null,
      fetchImpl: provider as unknown as typeof fetch,
      logger: createLogger({ sink: () => undefined }),
      alert,
      once: new MemoryOnceStore(() => NOW),
      cap: new MemoryRateLimitStore(),
      now: () => NOW,
      load: async () => (doc === null ? null : ({ ...closure, ...doc } as typeof closure)),
    });
    return { handler, provider, alert };
  }
  const call = (h: (r: Request) => Promise<Response>, body = { _id: "ann-1" }, signed = true) => {
    const raw = JSON.stringify(body);
    return h(new Request("https://stars.test/api/alerts/text", { method: "POST", headers: signed ? { [SIGNATURE_HEADER]: signPayload(raw, SECRET, NOW) } : {}, body: raw }));
  };

  it("sends a signed, bilingual alert once, even if the webhook fires again", async () => {
    const { handler, provider, alert } = setup();
    const res = await call(handler);
    expect(await res.json()).toMatchObject({ ok: true, sent: true });
    const [url, init] = provider.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://hooks.sms.test/stars");
    const payload = JSON.parse(init.body as string);
    expect(payload.message).toContain("STARS Academy: Closed today");
    expect(payload.message).toContain("Cerrado hoy");
    expect((init.headers as Record<string, string>)["X-Stars-Signature"]).toMatch(/^[0-9a-f]{64}$/);
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ title: "Text alert sent to families" }));

    expect(await (await call(handler)).json()).toMatchObject({ sent: false, reason: "already-sent" });
    expect(provider).toHaveBeenCalledOnce();
  });

  it.each([
    [{ sendText: false }, "not-requested"],
    [{ kind: "info" }, "kind-not-allowed"],
    [{ endsAt: "2026-01-09T10:30:00Z" }, "already-over"],
    [{ startsAt: "2026-01-10T12:00:00Z", endsAt: null }, "too-early"],
    [{ text: { en: "", es: null } }, "no-text"],
    [{ text: { en: "á".repeat(280), es: null } }, "too-long"],
  ] as const)("skips %o (%s)", async (doc, reason) => {
    const { handler, provider } = setup({ doc: doc as Partial<typeof closure> });
    expect(await (await call(handler)).json()).toMatchObject({ ok: true, sent: false, reason });
    expect(provider).not.toHaveBeenCalled();
  });

  it("sends nothing unless switched on, and only previews in dry-run", async () => {
    const off = setup({ mode: "" });
    expect(await (await call(off.handler)).json()).toMatchObject({ reason: "disabled" });
    const dry = setup({ mode: "dry-run" });
    expect(await (await call(dry.handler)).json()).toMatchObject({ reason: "dry-run" });
    expect(dry.provider).not.toHaveBeenCalled();
    expect(dry.alert).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("dry run"), details: expect.objectContaining({ preview: expect.stringContaining("icy roads") }) }));
  });

  it("rejects unsigned requests and ignores drafts", async () => {
    const { handler, provider } = setup();
    expect((await call(handler, { _id: "ann-1" }, false)).status).toBe(401);
    expect(await (await call(handler, { _id: "drafts.ann-1" })).json()).toMatchObject({ reason: "not-a-published-document" });
    expect(provider).not.toHaveBeenCalled();
  });

  it("caps alerts at four in six hours", async () => {
    const { handler, provider, alert } = setup();
    for (let i = 0; i < 4; i++) await call(handler, { _id: `ann-${i}` });
    expect(await (await call(handler, { _id: "ann-9" })).json()).toMatchObject({ reason: "rate-capped" });
    expect(provider).toHaveBeenCalledTimes(4);
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ severity: "critical", title: expect.stringContaining("NOT sent") }));
  });

  it("alerts staff and allows a retry when the provider fails", async () => {
    const failing = setup({ providerOk: false });
    expect((await call(failing.handler)).status).toBe(502);
    expect(failing.alert).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("FAILED") }));
    // The same notice can be retried (the send was not marked as done).
    expect((await call(failing.handler)).status).toBe(502);
    expect(failing.provider).toHaveBeenCalledTimes(2);
  });
});
