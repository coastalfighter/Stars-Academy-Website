import { expect, test, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";
import { INSIGHTS_PASSWORD } from "./env";
import { expectAccessible } from "./helpers";

/**
 * Privacy-friendly analytics and the staff dashboard.
 *
 * Automated browsers are never counted (navigator.webdriver), so the rest of
 * the suite leaves no trace in the counters; these tests opt back in by
 * hiding that flag. Counts are read back through the staff CSV export.
 * @local: relies on this run's own server-side counters.
 */
test.describe.configure({ mode: "serial" });
test.skip(({ isMobile }) => isMobile, "Counter assertions run once, on desktop.");

const asVisitor = (ctx: BrowserContext) =>
  ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false }));

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(INSIGHTS_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/insights$/);
}

/** Today's count for one CSV row, e.g. ("page views", "Accessibility"). */
async function count(request: APIRequestContext, section: string, item: string): Promise<number> {
  const csv = await (await request.get("/api/insights/export?range=7")).text();
  const row = csv.split("\r\n").find((l) => l.startsWith(`${section},${item},`) || l.startsWith(`${section},"${item}",`));
  return row ? Number(row.split(",").at(-1)) : 0;
}

test("staff pages require sign-in and are kept out of search", { tag: "@local" }, async ({ page, request }) => {
  await page.goto("/admin/insights");
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await request.get("/admin/login")).headers()["x-robots-tag"]).toContain("noindex");
  expect((await request.get("/api/insights/export")).status()).toBe(401);

  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That password didn’t match.")).toBeVisible();
});

test("page views, visits and taps are counted without identifiers", { tag: "@local" }, async ({ browser, page }, testInfo) => {
  await signIn(page);
  const staff = page.request;
  const views = await count(staff, "page views", "Accessibility");
  const taps = await count(staff, "interactions", "Tapped the phone number");
  const campaigns = await count(staff, "campaigns", "e2e-campaign (e2e-flyer)");

  const ctx = await browser.newContext({ ...testInfo.project.use });
  await asVisitor(ctx);
  const visitor = await ctx.newPage();
  const beacons: string[] = [];
  visitor.on("request", (r) => {
    if (r.url().endsWith("/api/collect")) beacons.push(r.method());
  });
  await visitor.goto("/accessibility?utm_source=e2e-flyer&utm_campaign=e2e-campaign");
  await visitor.locator('a[href^="tel:"]').first().dispatchEvent("click");
  await expect.poll(() => beacons.length).toBeGreaterThanOrEqual(2);
  // No cookies are set for visitors, ever.
  expect(await ctx.cookies()).toEqual([]);
  await ctx.close();

  await expect.poll(() => count(staff, "page views", "Accessibility")).toBe(views + 1);
  expect(await count(staff, "interactions", "Tapped the phone number")).toBe(taps + 1);
  expect(await count(staff, "campaigns", "e2e-campaign (e2e-flyer)")).toBe(campaigns + 1);
});

test("Global Privacy Control and the opt-out switch stop all counting", { tag: "@local" }, async ({ browser, page }, testInfo) => {
  await signIn(page);
  const before = await count(page.request, "page views", "Nondiscrimination");

  // 1. A browser that sends GPC.
  const gpc = await browser.newContext({ ...testInfo.project.use, extraHTTPHeaders: { "Sec-GPC": "1" } });
  await asVisitor(gpc);
  await gpc.addInitScript(() => Object.defineProperty(Navigator.prototype, "globalPrivacyControl", { get: () => true }));
  const p1 = await gpc.newPage();
  await p1.goto("/nondiscrimination");
  await p1.goto("/privacy");
  await expect(p1.getByText(/Your browser asks websites not to track you/)).toBeVisible();
  await gpc.close();

  // 2. A visitor who switches counting off on the privacy page.
  const ctx = await browser.newContext({ ...testInfo.project.use });
  await asVisitor(ctx);
  const p2 = await ctx.newPage();
  await p2.goto("/privacy");
  const toggle = p2.getByRole("switch", { name: "Count my visits anonymously" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  const beacons: string[] = [];
  p2.on("request", (r) => {
    if (r.url().endsWith("/api/collect")) beacons.push(r.url());
  });
  await p2.goto("/nondiscrimination");
  await p2.waitForTimeout(500);
  expect(beacons).toEqual([]);
  await ctx.close();

  expect(await count(page.request, "page views", "Nondiscrimination")).toBe(before);
});

test("the dashboard is accessible, exports CSV and signs out", { tag: "@local" }, async ({ page }, testInfo) => {
  await page.goto("/admin/login");
  await expectAccessible(page, testInfo, "/admin/login");
  await signIn(page);
  await expect(page.getByRole("heading", { level: 1, name: "Website insights" })).toBeVisible();
  await page.getByRole("link", { name: "7 days" }).click();
  await expect(page.getByRole("link", { name: "7 days" })).toHaveAttribute("aria-current", "page");
  await expectAccessible(page, testInfo, "/admin/insights");

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download CSV" }).click();
  expect((await download).suggestedFilename()).toMatch(/^stars-website-insights-.+\.csv$/);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/insights");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
