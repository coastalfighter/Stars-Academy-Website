import { expect, test } from "@playwright/test";

/** Enrollment check and secure referral panel, on the site without a CMS. */

test("the enrollment check works from the keyboard and never sends answers", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && !r.url().endsWith("/api/collect")) posts.push(r.url());
  });
  await page.goto("/enroll");
  await expect(page.getByText("Question 1 of 4")).toBeVisible();

  await page.getByLabel("Under 3").check();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "What health coverage does your child have?" })).toBeFocused();
  await page.getByLabel("Private insurance").check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("No", { exact: true }).check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "See what’s next" }).click();

  await expect(page.getByRole("heading", { name: "Let’s talk it through. We can help." })).toBeFocused();
  await expect(page.getByText("We’ll check with you what your private insurance covers.")).toBeVisible();
  await expect(page.getByText(/prescribed by a primary care doctor/)).toBeVisible();
  const secure = page.getByRole("main").getByRole("link", { name: /Start secure enrollment/ }).first();
  await expect(secure).toHaveAttribute("href", /^https:\/\/na4\.documents\.adobe\.com\//);
  await expect(secure).toHaveAttribute("target", "_blank");
  expect(posts).toEqual([]);
});

test("the secure enrollment link works without the check (and without JavaScript)", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/es/inscripcion");
  await expect(page.getByRole("heading", { name: "¿Ya sabe que quiere inscribir a su hijo?" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Comenzar la inscripción segura/ })).toHaveAttribute("href", /documents\.adobe\.com/);
  await ctx.close();
});

test("old enroll-now links land on the enrollment check", async ({ page }) => {
  await page.goto("/enroll-now");
  await expect(page).toHaveURL(/\/enroll$/);
});

test("referral partners are told how to send records securely", async ({ page }) => {
  await page.goto("/referrals");
  const panel = page.getByRole("region", { name: "Prescriptions and records, the secure way." });
  await expect(panel).toContainText("Please don’t email health information");
  await expect(panel.getByRole("heading", { name: "Call our intake team" })).toBeVisible();
  // Without a CMS nothing else is configured, so nothing else is offered.
  await expect(panel.getByRole("heading", { name: "Upload securely" })).toHaveCount(0);
});
