import { expect, test } from "@playwright/test";
import { isSpanish, sitemapPaths, watchForErrors } from "./helpers";
import { LEGACY_REDIRECTS } from "../src/lib/launch/legacyRedirects";

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

  test("every old-site URL redirects permanently to a live page", async ({ request }) => {
    for (const r of LEGACY_REDIRECTS) {
      const res = await request.get(r.from, { maxRedirects: 0 });
      expect(res.status(), r.from).toBe(308);
      expect(new URL(res.headers().location!, "http://x").pathname, r.from).toBe(r.to);
      expect((await request.get(r.from)).status(), r.to).toBe(200);
    }
    // Query strings (campaign tags on old printed links) survive the redirect.
    const tagged = await request.get("/enroll-now?utm_source=flyer", { maxRedirects: 0 });
    expect(tagged.headers().location).toBe("/getting-started?utm_source=flyer");
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

  test("sitemap lists hreflang alternates; robots keeps private paths and previews out of search", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain('hreflang="es-US"');
    const robots = await request.get("/robots.txt");
    const body = await robots.text();
    if ((await request.get("/")).headers()["x-robots-tag"]?.includes("noindex")) {
      // A preview deployment: nothing may be indexed.
      expect(body).toContain("Disallow: /");
      expect(body).not.toContain("Sitemap:");
    } else {
      expect(body).toContain("Disallow: /api/");
      expect(body).toContain("Disallow: /admin");
    }
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
