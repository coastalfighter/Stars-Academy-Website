import { isValidPreviewSecret, safeRedirect } from "@/cms/preview";
import { cmsConfig } from "@/cms/config";

const config = cmsConfig({ SANITY_PROJECT_ID: "abc123", SANITY_READ_TOKEN: "tok" } as unknown as NodeJS.ProcessEnv);
const SECRET = "a".repeat(43);
const reply = (result: unknown) => vi.fn(async () => new Response(JSON.stringify({ result }), { status: 200 }));

describe("safeRedirect", () => {
  it.each([
    ["/es/familias", "/es/familias"],
    ["/families#announcements", "/families#announcements"],
    ["/faq?x=1", "/faq?x=1"],
    ["//evil.example", "/"],
    ["https://evil.example", "/"],
    ["/\\evil.example", "/"],
    [null, "/"],
  ] as const)("%s → %s", (input, expected) => {
    expect(safeRedirect(input)).toBe(expected);
  });
});

describe("isValidPreviewSecret", () => {
  it("accepts a live secret, checked server-side with the token", async () => {
    const fetchImpl = reply({ secret: SECRET });
    expect(await isValidPreviewSecret(SECRET, { config, fetchImpl: fetchImpl as unknown as typeof fetch })).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("abc123.api.sanity.io");
    expect(init.headers).toEqual({ Authorization: "Bearer tok" });
  });

  it("rejects unknown or expired secrets", async () => {
    expect(await isValidPreviewSecret(SECRET, { config, fetchImpl: reply(null) as unknown as typeof fetch })).toBe(false);
  });

  it("rejects malformed secrets without querying", async () => {
    const fetchImpl = reply({ secret: "x" });
    expect(await isValidPreviewSecret("short", { config, fetchImpl: fetchImpl as unknown as typeof fetch })).toBe(false);
    expect(await isValidPreviewSecret(null, { config, fetchImpl: fetchImpl as unknown as typeof fetch })).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("is disabled without a read token", async () => {
    const noToken = cmsConfig({ SANITY_PROJECT_ID: "abc123" } as unknown as NodeJS.ProcessEnv);
    expect(await isValidPreviewSecret(SECRET, { config: noToken, fetchImpl: reply({ secret: SECRET }) as unknown as typeof fetch })).toBe(false);
  });
});
