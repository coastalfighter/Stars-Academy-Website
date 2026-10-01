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
  });

  test("sitemap lists hreflang alternates and robots disallows the API", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain('hreflang="es-US"');
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /api/");
  });
});
