import { expect, test, type Page } from "@playwright/test";
import { force3d } from "./helpers";

test.skip(({ isMobile }) => isMobile, "The pinned 3D story is a desktop experience; mobile gets stacked lists (covered in calm.spec).");

test.beforeEach(({ page }) => force3d(page));

async function scrollToChapter(page: Page, id: string, fraction: number) {
  await page.evaluate(
    ([chapter, f]) => {
      const el = document.querySelector<HTMLElement>(`[data-chapter="${chapter}"]`)!;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * Number(f) - window.innerHeight / 2);
    },
    [id, fraction] as const,
  );
  await page.waitForTimeout(700);
}

test("the 3D scene renders and follows the scroll story", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(1);
  // The canvas is decorative: it sits inside an aria-hidden layer.
  await expect(page.locator('[aria-hidden="true"] canvas')).toHaveCount(1);

  // The day chapter's clock runs from morning to afternoon.
  await scrollToChapter(page, "day", 0.1);
  const clock = page.getByTestId("day-clock");
  await expect(clock).toHaveText(/^\d{1,2}:\d{2} a\.m\.$/);
  await scrollToChapter(page, "day", 0.9);
  await expect(clock).toHaveText(/^\d{1,2}:\d{2} p\.m\.$/);

  // The services list highlights each discipline in turn.
  const current = page.locator('#services [aria-current="true"]');
  await scrollToChapter(page, "services", 0.08);
  await expect(current).toContainText("Developmental Classrooms");
  await scrollToChapter(page, "services", 0.9);
  await expect(current).toContainText("Nursing Care");
});

test("the Spanish story uses Spanish time formatting", async ({ page }) => {
  await page.goto("/es");
  await scrollToChapter(page, "day", 0.1);
  await expect(page.getByTestId("day-clock")).toHaveText(/^\d{1,2}:\d{2} a\. m\.$/);
});
