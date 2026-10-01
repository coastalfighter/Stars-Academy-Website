import { redact, redactText, safeUrl } from "@/lib/observability/redact";

describe("redactText", () => {
  it("masks contact details, IPs, dates and long numbers", () => {
    const out = redactText("Call jane.doe@example.com or (870) 555-0134 from 203.0.113.9, DOB 04/12/2021, Medicaid 123456789012");
    expect(out).not.toMatch(/jane|555|203\.0|04\/12|123456789012/);
    expect(out).toContain("[email]");
    expect(out).toContain("[phone]");
    expect(out).toContain("[ip]");
    expect(out).toContain("[date]");
    expect(out).toContain("[number]");
  });

  it("leaves ordinary diagnostics alone and caps length", () => {
    expect(redactText("TypeError: x is undefined at line 42")).toBe("TypeError: x is undefined at line 42");
    expect(redactText("a".repeat(5000)).length).toBeLessThanOrEqual(1001);
  });
});

describe("redact", () => {
  it("replaces sensitive fields by name, at any depth", () => {
    const out = redact({ reason: "tour", name: "Jordan", nested: { Email: "a@b.co", headers: { authorization: "Bearer x" } } });
    expect(out).toEqual({ reason: "tour", name: "[redacted]", nested: { Email: "[redacted]", headers: { authorization: "[redacted]" } } });
  });

  it("keeps diagnostic fields readable (only patterns inside them are masked)", () => {
    expect(redact({ errorMessage: "x failed for a@b.co", error: new Error("boom") })).toEqual({
      errorMessage: "x failed for [email]",
      error: { name: "Error", message: "boom" },
    });
  });

  it("serialises errors without their stack and keeps the digest", () => {
    const e = Object.assign(new Error("failed for a@b.co"), { digest: "123abc" });
    expect(redact(e)).toEqual({ name: "Error", message: "failed for [email]", digest: "123abc" });
  });

  it("bounds depth and handles odd values without throwing", () => {
    const deep: Record<string, unknown> = {};
    let cur = deep;
    for (let i = 0; i < 10; i++) cur = (cur.next = {}) as Record<string, unknown>;
    expect(JSON.stringify(redact(deep))).toContain("[truncated]");
    expect(redact(10n)).toBe("10");
    expect(redact(() => 1)).toBe("[function]");
  });
});

describe("safeUrl", () => {
  it("drops query strings and fragments", () => {
    expect(safeUrl("https://stars.test/contact-us?name=Jane&phone=8705550134#form")).toBe("https://stars.test/contact-us");
    expect(safeUrl("/faq?q=x")).toBe("/faq");
  });

  it("reduces non-web URLs to their scheme and rejects junk", () => {
    expect(safeUrl("chrome-extension://abc/script.js")).toBe("chrome-extension");
    expect(safeUrl(42)).toBeUndefined();
    expect(safeUrl("")).toBeUndefined();
  });
});
