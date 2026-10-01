import { signPayload, verifySignature, MAX_SKEW_MS } from "@/cms/webhook";
import { createRevalidateHandler } from "@/cms/revalidateHandler";
import { cmsConfig } from "@/cms/config";

const SECRET = "whsec_test";
const NOW = 1_800_000_000_000;
const body = JSON.stringify({ _type: "announcement", _id: "a1" });

describe("webhook signatures", () => {
  it("round-trips", () => {
    expect(verifySignature(signPayload(body, SECRET, NOW), body, SECRET, NOW)).toEqual({ ok: true });
  });

  it.each([
    ["missing", null],
    ["malformed", "garbage"],
    ["stale", signPayload(body, SECRET, NOW - MAX_SKEW_MS - 1)],
    ["mismatch", signPayload(body, "other", NOW)],
    ["mismatch", signPayload(`${body} `, SECRET, NOW)],
  ] as const)("rejects %s", (reason, header) => {
    expect(verifySignature(header, body, SECRET, NOW)).toEqual({ ok: false, reason });
  });
});

describe("POST /api/revalidate", () => {
  const config = cmsConfig({ SANITY_PROJECT_ID: "abc123", SANITY_WEBHOOK_SECRET: SECRET } as unknown as NodeJS.ProcessEnv);
  const req = (payload: string, header: string | null = signPayload(payload, SECRET, NOW)) =>
    new Request("https://stars.test/api/revalidate", {
      method: "POST",
      headers: header ? { "sanity-webhook-signature": header } : {},
      body: payload,
    });
  const setup = (cfg = config) => {
    const revalidate = vi.fn();
    return { revalidate, handler: createRevalidateHandler({ config: cfg, revalidate, now: () => NOW }) };
  };

  it("is unavailable until configured", async () => {
    const { handler } = setup(null);
    expect((await handler(req(body))).status).toBe(503);
  });

  it("rejects bad signatures without revalidating", async () => {
    const { handler, revalidate } = setup();
    expect((await handler(req(body, "t=1,v1=x"))).status).toBe(401);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("refreshes announcements immediately and other content in the background", async () => {
    const { handler, revalidate } = setup();
    const res = await handler(req(body));
    expect(await res.json()).toEqual({ ok: true, revalidated: ["cms:announcement"] });
    expect(revalidate).toHaveBeenCalledWith("cms:announcement", { expire: 0 });

    const faq = JSON.stringify({ _type: "faq" });
    await handler(req(faq));
    expect(revalidate).toHaveBeenLastCalledWith("cms:faq", "max");
  });

  it("ignores unrelated document types and rejects invalid JSON", async () => {
    const { handler, revalidate } = setup();
    const other = JSON.stringify({ _type: "sanity.imageAsset" });
    expect(await (await handler(req(other))).json()).toEqual({ ok: true, revalidated: [] });
    expect((await handler(req("{not json"))).status).toBe(400);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("rejects oversized payloads", async () => {
    const { handler } = setup();
    expect((await handler(req("x".repeat(70_000)))).status).toBe(413);
  });
});
