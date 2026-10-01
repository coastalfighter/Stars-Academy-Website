import { test } from "@playwright/test";
import { expectAccessible, sitemapPaths } from "./helpers";

/** Representative pages of every template, in both languages. */
const PAGES = [
  "/",
  "/services",
  "/services/nursing-care",
  "/getting-started",
  "/families",
  "/faq",
  "/about-us",
  "/contact-us",
  "/referrals",
  "/careers/apply",
  "/privacy",
  "/events",
  "/resources",
  "/team",
  "/photos",
  "/es",
  "/es/servicios/terapia-del-habla-y-lenguaje",
  "/es/como-empezar",
  "/es/preguntas-frecuentes",
  "/es/programar-visita",
  "/es/recursos",
  "/es/fotos",
];

for (const path of PAGES) {
  test(`${path} has no serious accessibility violations`, async ({ page }, testInfo) => {
    await page.goto(path, { waitUntil: "networkidle" });
    // Let reveal-on-scroll content become visible so contrast is measured on final colours.
    await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((e) => ((e as HTMLElement).dataset.revealed = "true")));
    await page.waitForTimeout(1000);
    await expectAccessible(page, testInfo, path);
  });
}

test("form error state is accessible", async ({ page }, testInfo) => {
  await page.goto("/schedule-a-tour");
  await page.getByRole("button", { name: /send my request/i }).click();
  await page.getByRole("alert").first().waitFor();
  await expectAccessible(page, testInfo, "tour-form-errors");
});

test.describe("launch sweep", () => {
  test.skip(({ isMobile }) => isMobile, "One full pass, on desktop; the list above runs on mobile too.");

  test("every page in the sitemap has no serious accessibility violations", async ({ page, request }, testInfo) => {
    test.setTimeout(300_000);
    // Reduced motion shows reveal-on-scroll content at full opacity at once, so
    // contrast is measured on final colours rather than mid-fade.
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of await sitemapPaths(request)) {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.querySelectorAll("[data-reveal]").forEach((e) => ((e as HTMLElement).dataset.revealed = "true")));
      await page.waitForTimeout(300);
      await expectAccessible(page, testInfo, path);
    }
  });
});
