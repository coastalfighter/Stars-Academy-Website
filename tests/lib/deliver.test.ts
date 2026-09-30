import { deliverInquiry, renderEmail, signBody, toPayload } from "@/lib/inquiry/deliver";
import { inquirySchema } from "@/lib/validation/inquiry";

const inquiry = inquirySchema.parse({
  audience: "family",
  reason: "tour",
  name: "Alex <script>",
  phone: "870-555-0134",
  preferredContact: "phone",
  message: "Hello",
  consent: true,
});
const now = new Date("2026-09-30T15:00:00Z");
const ok = () => new Response("{}", { status: 200 });

describe("deliverInquiry", () => {
  it("reports not-configured when no channel is set", async () => {
    expect(await deliverInquiry(inquiry, { env: {} as NodeJS.ProcessEnv, fetchImpl: vi.fn() })).toEqual({
      ok: false,
      reason: "not-configured",
    });
  });

  it("sends email through Resend with auth header", async () => {
    const fetchImpl = vi.fn(async () => ok());
    const env = { RESEND_API_KEY: "re_test", INQUIRY_TO_EMAIL: "a@x.test, b@x.test" } as unknown as NodeJS.ProcessEnv;
    const result = await deliverInquiry(inquiry, { env, fetchImpl, now });
    expect(result).toEqual({ ok: true, channels: ["email"] });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body as string).to).toEqual(["a@x.test", "b@x.test"]);
  });

  it("signs webhook bodies with HMAC-SHA256", async () => {
    const fetchImpl = vi.fn(async () => ok());
    const env = { INQUIRY_WEBHOOK_URL: "https://hooks.test/x", INQUIRY_WEBHOOK_SECRET: "s3cret" } as unknown as NodeJS.ProcessEnv;
    await deliverInquiry(inquiry, { env, fetchImpl, now });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers["X-Stars-Signature"]).toBe(signBody(init.body as string, "s3cret"));
  });

  it("succeeds if at least one channel works", async () => {
    const fetchImpl = vi.fn(async (url: string) => (url.includes("resend") ? new Response("", { status: 500 }) : ok()));
    const env = {
      RESEND_API_KEY: "k",
      INQUIRY_TO_EMAIL: "a@x.test",
      INQUIRY_WEBHOOK_URL: "https://hooks.test/x",
    } as unknown as NodeJS.ProcessEnv;
    expect(await deliverInquiry(inquiry, { env, fetchImpl: fetchImpl as unknown as typeof fetch, now })).toEqual({
      ok: true,
      channels: ["webhook"],
    });
  });

  it("fails with detail when every channel fails", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 503 }));
    const env = { INQUIRY_WEBHOOK_URL: "https://hooks.test/x" } as unknown as NodeJS.ProcessEnv;
    const result = await deliverInquiry(inquiry, { env, fetchImpl, now });
    expect(result).toMatchObject({ ok: false, reason: "failed" });
    if (!result.ok) expect(result.detail).toContain("503");
  });
});

describe("renderEmail", () => {
  it("escapes HTML in user content", () => {
    const { html, subject, text } = renderEmail(toPayload(inquiry, now));
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(subject).toContain("Schedule a tour");
    expect(text).toContain("Phone: 870-555-0134");
  });
});
