import { z } from "zod";
import { cmsConfig } from "@/cms/config";
import { cmsQuery, queryUrl } from "@/cms/client";

const config = cmsConfig({ SANITY_PROJECT_ID: "abc123", SANITY_READ_TOKEN: "tok" } as unknown as NodeJS.ProcessEnv)!;
const schema = z.array(z.object({ a: z.number() }));
const opts = { tags: ["cms:faq"], revalidate: 60 };
const ok = (result: unknown) => new Response(JSON.stringify({ result }), { status: 200 });
const published = async () => false;
const drafts = async () => true;

describe("cmsConfig", () => {
  it("is off without a project id", () => {
    expect(cmsConfig({} as NodeJS.ProcessEnv)).toBeNull();
  });

  it("rejects values that could redirect requests", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(cmsConfig({ SANITY_PROJECT_ID: "evil.com/x" } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(cmsConfig({ SANITY_PROJECT_ID: "abc123", SANITY_DATASET: "../x" } as unknown as NodeJS.ProcessEnv)).toBeNull();
    warn.mockRestore();
  });

  it("applies defaults", () => {
    expect(config).toMatchObject({ projectId: "abc123", dataset: "production", apiVersion: "2025-02-19", readToken: "tok" });
  });
});

describe("queryUrl", () => {
  it("reads published content through the CDN with JSON-encoded params", () => {
    const url = new URL(queryUrl(config, "*[_type == $t]", { t: "faq" }, false));
    expect(url.host).toBe("abc123.apicdn.sanity.io");
    expect(url.pathname).toBe("/v2025-02-19/data/query/production");
    expect(url.searchParams.get("$t")).toBe('"faq"');
    expect(url.searchParams.get("perspective")).toBe("published");
  });

  it("reads drafts from the live API", () => {
    const url = new URL(queryUrl(config, "*", {}, true));
    expect(url.host).toBe("abc123.api.sanity.io");
    expect(url.searchParams.get("perspective")).toBe("drafts");
  });
});

describe("cmsQuery", () => {
  beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("returns null without calling the network when the CMS is off", async () => {
    const fetchImpl = vi.fn();
    expect(await cmsQuery("*", {}, schema, opts, { config: null, fetchImpl })).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("caches published reads with tags", async () => {
    const fetchImpl = vi.fn(async () => ok([{ a: 1 }]));
    const result = await cmsQuery("*", {}, schema, opts, { config, fetchImpl: fetchImpl as unknown as typeof fetch, isDraft: published });
    expect(result).toEqual([{ a: 1 }]);
    const init = (fetchImpl.mock.calls[0] as unknown as [string, RequestInit & { next?: unknown }])[1];
    expect(init.cache).toBe("force-cache");
    expect(init.next).toEqual({ tags: ["cms:faq"], revalidate: 60 });
    expect(init.headers).toEqual({});
  });

  it("previews drafts uncached with the read token", async () => {
    const fetchImpl = vi.fn(async () => ok([]));
    await cmsQuery("*", {}, schema, opts, { config, fetchImpl: fetchImpl as unknown as typeof fetch, isDraft: drafts });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain(".api.sanity.io");
    expect(init.cache).toBe("no-store");
    expect(init.headers).toEqual({ Authorization: "Bearer tok" });
  });

  it("never previews drafts without a token", async () => {
    const fetchImpl = vi.fn(async () => ok([]));
    const noToken = { ...config, readToken: null };
    await cmsQuery("*", {}, schema, opts, { config: noToken, fetchImpl: fetchImpl as unknown as typeof fetch, isDraft: drafts });
    expect((fetchImpl.mock.calls[0] as unknown as [string])[0]).toContain(".apicdn.sanity.io");
  });

  it.each([
    ["an HTTP error", async () => new Response("nope", { status: 500 })],
    ["an unexpected shape", async () => ok([{ a: "not a number" }])],
    ["a network failure", async () => { throw new TypeError("offline"); }],
  ])("falls back (null) on %s", async (_, impl) => {
    const fetchImpl = vi.fn(impl);
    expect(await cmsQuery("*", {}, schema, opts, { config, fetchImpl: fetchImpl as unknown as typeof fetch, isDraft: published })).toBeNull();
  });
});
