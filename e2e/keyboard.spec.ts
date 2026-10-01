import { expect, test } from "@playwright/test";

test("the skip link is first and moves focus to the main content", async ({ page, isMobile }) => {
  test.skip(isMobile, "Keyboard navigation is a desktop concern.");
  await page.goto("/faq");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("FAQ answers open and close from the keyboard", async ({ page, isMobile }) => {
  test.skip(isMobile);
  await page.goto("/faq");
  const summary = page.locator("summary", { hasText: "What ages does STARS serve?" });
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("STARS serves children from birth to age six.")).toBeVisible();
});

test("the mobile menu traps focus and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The menu button only appears on small screens.");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");

  // Focus starts inside the panel and never escapes it.
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => {
      const panel = document.querySelector("header [id] > .container-x")?.parentElement;
      return Boolean(panel && panel.contains(document.activeElement));
    });
    expect(inside).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
});
