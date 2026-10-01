import { expect, test } from "@playwright/test";
import { force3d } from "./helpers";

test.describe("reduced motion (OS setting)", () => {
  test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "reduced-motion"));

  test("starts in calm mode: no WebGL, no pinned sections, all content readable", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-calm", "true");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("switch", { name: /calm mode/i })).toHaveAttribute("aria-checked", "true");
    // Every moment of the day is listed (not scrubbed by scroll).
    for (const moment of ["Arrive & connect", "Learn through play", "Therapy, woven in", "Care & nourishment", "Head home"]) {
      await expect(page.getByRole("heading", { name: moment })).toBeVisible();
    }
  });
});

test.describe("calm mode switch", () => {
  test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== "desktop"));

  test("turns the 3D scene off and remembers the choice", async ({ page }) => {
    await force3d(page);
    await page.goto("/");
    await expect(page.locator("canvas")).toHaveCount(1);
    await page.getByRole("switch", { name: /calm mode/i }).click();
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("data-calm", "true");
    await page.reload();
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByRole("switch", { name: /calm mode/i })).toHaveAttribute("aria-checked", "true");
  });
});

test.describe("mobile layout", () => {
  test.skip(({ isMobile }) => !isMobile);

  test("never scrolls sideways", async ({ page }) => {
    for (const path of ["/", "/es", "/services/speech-therapy", "/es/como-empezar", "/faq", "/careers"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});
