import { checkLink, classify, externalLinks } from "../../scripts/check-links.mjs";

describe("resource link checker", () => {
  it("separates broken links from bot-protected ones", () => {
    expect(classify(200)).toBe("ok");
    expect(classify(301)).toBe("ok");
    expect(classify(403)).toBe("unverified");
    expect(classify(429)).toBe("unverified");
    expect(classify(404)).toBe("broken");
    expect(classify(410)).toBe("broken");
    expect(classify(500)).toBe("broken");
  });

  it("treats network failures as broken", async () => {
    const failing = vi.fn(async () => Promise.reject(new Error("getaddrinfo ENOTFOUND"))) as unknown as typeof fetch;
    expect(await checkLink("https://gone.example", failing)).toEqual({ url: "https://gone.example", status: "broken", detail: "getaddrinfo ENOTFOUND" });
  });

  it("checks every external bundled link, all over https", () => {
    const links = externalLinks();
    expect(links.length).toBeGreaterThanOrEqual(4);
    for (const l of links) expect(l).toMatch(/^https:\/\//);
  });
});
