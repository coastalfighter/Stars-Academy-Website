import { readBody } from "@/lib/security/body";

const req = (body: BodyInit | null, headers: Record<string, string> = {}) =>
  new Request("https://stars.test/api/x", { method: "POST", body, headers, ...(body instanceof ReadableStream ? { duplex: "half" } : {}) } as RequestInit);

describe("readBody", () => {
  it("reads bodies within the limit", async () => {
    expect(await readBody(req("héllo"), 100)).toEqual({ ok: true, text: "héllo" });
    expect(await readBody(req(null), 100)).toEqual({ ok: true, text: "" });
  });

  it("rejects by declared or actual size", async () => {
    expect(await readBody(req("x", { "content-length": "999" }), 100)).toEqual({ ok: false, status: 413 });
    expect(await readBody(req("x".repeat(101)), 100)).toEqual({ ok: false, status: 413 });
  });

  it("rejects invalid UTF-8", async () => {
    expect(await readBody(req(new Uint8Array([0xff, 0xfe, 0xfd])), 100)).toEqual({ ok: false, status: 400 });
  });
});
