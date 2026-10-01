import { expect, test } from "@playwright/test";

/** Community pages on the site without a CMS (bundled content and empty states). */

test.skip(({ isMobile }) => isMobile, "Gallery keyboard checks run on desktop; layout is covered by the a11y and mobile specs.");

test("events show a helpful empty state without a CMS", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByText("No events are scheduled right now.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Schedule a tour" }).last()).toHaveAttribute("href", "/schedule-a-tour");
});

test("the resource library opens outside links safely and stays on-site for our pages", async ({ page }) => {
  await page.goto("/resources");
  const external = page.getByRole("link", { name: /HealthyChildren\.org/ });
  await expect(external).toHaveAttribute("target", "_blank");
  await expect(external).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByRole("link", { name: "How enrollment works" })).toHaveAttribute("href", "/getting-started");
  await page.getByRole("navigation", { name: "Topics" }).getByRole("link", { name: "Community support" }).click();
  await expect(page).toHaveURL(/#topic-community$/);
});

test("the photo viewer works from the keyboard and returns focus", async ({ page }) => {
  await page.goto("/es/fotos");
  const first = page.getByRole("link", { name: /Ver más grande/ }).first();
  await first.focus();
  await page.keyboard.press("Enter");
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Foto 1 de 5");
  await page.keyboard.press("ArrowRight");
  await expect(dialog).toContainText("Foto 2 de 5");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(first).toBeFocused();
});

test("the team page explains every role even before staff profiles are added", async ({ page }) => {
  await page.goto("/es/equipo");
  await expect(page.getByRole("heading", { name: "Con quién trabaja su hijo" })).toBeVisible();
  await expect(page.getByText("Patólogos del habla y lenguaje")).toBeVisible();
});
