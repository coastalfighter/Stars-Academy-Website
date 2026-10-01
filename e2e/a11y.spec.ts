import { test } from "@playwright/test";
import { expectAccessible } from "./helpers";

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
