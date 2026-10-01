import { expect, test } from "@playwright/test";
import { isSpanish, sitemapPaths, watchForErrors } from "./helpers";

test.describe("every page", () => {
  test.skip(({ isMobile }) => isMobile, "Covered once on desktop; layout checks run per viewport elsewhere.");

  test("loads with the right language, one h1, metadata and no errors", async ({ page, request }) => {
    test.setTimeout(240_000);
    const paths = await sitemapPaths(request);
    expect(paths.length).toBeGreaterThanOrEqual(37);

    for (const path of paths) {
      const errors = watchForErrors(page);
      const res = await page.goto(path, { waitUntil: "load" });
      expect(res?.status(), path).toBe(200);
      await expect(page.locator("html"), path).toHaveAttribute("lang", isSpanish(path) ? "es-US" : "en-US");
      await expect(page.locator("h1"), path).toHaveCount(1);
      await expect(page, path).toHaveTitle(/STARS Academy/);
      expect(await page.locator('link[rel="canonical"]').count(), path).toBe(1);
      expect(errors, path).toEqual([]);
      page.removeAllListeners();
    }
  });
});

test.describe("HTTP behaviour", () => {
  test.skip(({ isMobile }) => isMobile);

  test("unknown URLs return a bilingual 404", async ({ request, page }) => {
    for (const path of ["/no-such-page", "/es/no-existe"]) {
      expect((await request.get(path)).status()).toBe(404);
    }
    await page.goto("/no-such-page");
    await expect(page.getByRole("heading", { name: "We couldn’t find that page." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "No encontramos esa página." })).toBeVisible();
  });

  test("old site URLs redirect permanently", async ({ request }) => {
    const res = await request.get("/nursing", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers().location).toBe("/services/nursing-care");
  });

  test("security headers are set", async ({ request }) => {
    const h = (await request.get("/")).headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["strict-transport-security"]).toContain("max-age=");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-powered-by"]).toBeUndefined();
    // Violations are reported back to the site.
    expect(h["content-security-policy"]).toContain("report-to csp");
    expect(h["reporting-endpoints"]).toBe('csp="/api/csp-report"');
  });

  test("sitemap lists hreflang alternates and robots disallows the API", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain('hreflang="es-US"');
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /api/");
  });
});

test.describe("operations endpoints", () => {
  test.skip(({ isMobile }) => isMobile);

  test("the health check reports readiness without secrets", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(res.headers()["cache-control"]).toContain("no-store");
    const body = (await res.json()) as { status: string; checks: Record<string, string> };
    expect(body.status).toBe("ok");
    expect(body.checks.inquiryDelivery).toBe("configured");
    expect(Object.keys(body.checks).sort()).toEqual(["alerts", "analytics", "content", "inquiryDelivery", "rateLimit"]);
    expect((await request.head("/api/health")).status()).toBe(200);
  });

  test("CSP reports are accepted in both browser formats", async ({ request }) => {
    const legacy = await request.post("/api/csp-report", {
      headers: { "content-type": "application/csp-report" },
      data: JSON.stringify({ "csp-report": { "document-uri": "https://x.test/", "blocked-uri": "inline", "violated-directive": "style-src" } }),
    });
    expect(legacy.status()).toBe(204);
    const modern = await request.post("/api/csp-report", {
      headers: { "content-type": "application/reports+json" },
      data: JSON.stringify([{ type: "csp-violation", body: { effectiveDirective: "img-src", blockedURL: "https://x.test/a.png" } }]),
    });
    expect(modern.status()).toBe(204);
  });

  test("browser error reports are same-origin only", async ({ request, baseURL }) => {
    const report = { kind: "unhandled", message: "E2E probe", path: "/", locale: "en" };
    expect((await request.post("/api/client-error", { headers: { origin: "https://evil.example" }, data: report })).status()).toBe(403);
    expect((await request.post("/api/client-error", { headers: { origin: new URL(baseURL!).origin }, data: report })).status()).toBe(204);
  });
});
