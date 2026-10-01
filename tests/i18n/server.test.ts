import { createInquiryHandler } from "@/lib/inquiry/handler";
import { MemoryRateLimitStore } from "@/lib/security/rateLimit";
import { inquirySchema, toFieldErrors } from "@/lib/validation/inquiry";
import { formatHour } from "@/lib/scroll/timeline";

const NOW = 1_000_000;
const silent = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
const post = (data: unknown, headers: Record<string, string> = {}) =>
  new Request("https://stars.test/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.5", ...headers },
    body: JSON.stringify(data),
  });

describe("Spanish responses", () => {
  const handler = createInquiryHandler({
    env: { NODE_ENV: "production" } as unknown as NodeJS.ProcessEnv,
    store: new MemoryRateLimitStore(),
    deliver: vi.fn(async () => ({ ok: true as const, channels: ["email" as const] })),
    now: () => NOW,
    logger: silent,
  });

  it("returns translated field errors when the form is sent from the Spanish site", async () => {
    const res = await handler(post({ locale: "es", audience: "family", reason: "tour", name: "", consent: false, startedAt: NOW - 9000 }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toMatch(/revise los campos/i);
    expect(json.fieldErrors.name).toMatch(/escriba su nombre/i);
  });

  it("thanks the family in Spanish", async () => {
    const res = await handler(
      post({ locale: "es", language: "es", audience: "family", reason: "tour", name: "Ana López", phone: "870-555-0134", preferredContact: "phone", consent: true, startedAt: NOW - 9000 }),
    );
    expect((await res.json()).message).toMatch(/^Gracias/);
  });

  it("answers in Spanish before the body is read, based on Accept-Language", async () => {
    const res = await handler(post({}, { origin: "https://evil.example", "accept-language": "es-US,es;q=0.9" }));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/No se permite/);
  });
});

describe("translated validation", () => {
  it("translates codes and defaults to English", () => {
    const r = inquirySchema.safeParse({ audience: "family", reason: "tour", name: "A", consent: true, phone: "1" });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(toFieldErrors(r.error).phone).toMatch(/10-digit/);
    expect(toFieldErrors(r.error, "es").phone).toMatch(/10 dígitos/);
  });

  it("formats the day clock in each language", () => {
    expect(formatHour(7.5, "es")).toBe("7:30 a. m.");
    expect(formatHour(15, "es")).toBe("3:00 p. m.");
    expect(formatHour(15)).toBe("3:00 p.m.");
  });
});
