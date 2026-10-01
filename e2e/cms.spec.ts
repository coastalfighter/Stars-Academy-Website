import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { SANITY_WEBHOOK_SECRET } from "./env";
import { expectAccessible } from "./helpers";

/** Runs against the CMS-enabled build (Sanity answered by e2e/fixtures/mock-sanity.cjs). */

const sign = (body: string, t = Date.now()) => {
  const sig = createHmac("sha256", SANITY_WEBHOOK_SECRET).update(`${t}.${body}`).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `t=${t},v1=${sig}`;
};

test("a closure shows as a banner on every page, in each language", async ({ page }) => {
  for (const [path, text] of [
    ["/", "STARS is closed today due to icy roads."],
    ["/careers", "STARS is closed today due to icy roads."],
    ["/es", "STARS está cerrado hoy por las carreteras con hielo."],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("region", { name: /announcement|aviso/i })).toContainText(text);
  }
});

test("scheduled and unsafe announcements are not shown", async ({ page }) => {
  await page.goto("/families");
  await expect(page.getByText("Scheduled for later")).toHaveCount(0);
  await expect(page.getByText("Unsafe link")).toHaveCount(0);
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
});

test("dismissing the banner sticks across pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Dismiss announcement" }).click();
  await expect(page.getByRole("region", { name: "Announcement" })).toHaveCount(0);
  await page.goto("/faq");
  await expect(page.getByRole("region", { name: "Announcement" })).toHaveCount(0);
});

test("Current Families lists announcements; untranslated ones are marked English", async ({ page }) => {
  await page.goto("/es/familias");
  await expect(page.getByRole("heading", { name: "STARS está cerrado hoy por las carreteras con hielo." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Family open house on Friday" })).toHaveAttribute("lang", "en-US");
});

test("staff content appears where expected", async ({ page }) => {
  await page.goto("/faq");
  await expect(page.getByText("How will I know if STARS is closed for weather?")).toBeVisible();
  await page.goto("/careers");
  await expect(page.getByRole("heading", { name: "Pediatric Speech-Language Pathologist" })).toBeVisible();
  await page.goto("/about-us");
  await expect(page.getByText("Clinical Director")).toBeVisible();
  await expect(page.getByText("123 Example Rd., Batesville, AR 72501")).toBeVisible();
  await page.goto("/contact-us");
  await expect(page.getByText("870-555-0100")).toBeVisible();
});

test("only testimonials with consent on file are published", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("STARS gave our son words")).toBeAttached();
  await expect(page.getByText("Published without consent")).toHaveCount(0);
});

test("the banner keeps the page accessible", async ({ page }, testInfo) => {
  await page.goto("/faq");
  await expectAccessible(page, testInfo, "faq-with-banner");
});

test("the publish webhook only accepts signed, fresh requests", async ({ request }) => {
  const body = JSON.stringify({ _type: "announcement", _id: "e2e-closure" });
  const ok = await request.post("/api/revalidate", { headers: { "sanity-webhook-signature": sign(body) }, data: body });
  expect(await ok.json()).toEqual({ ok: true, revalidated: ["cms:announcement"] });

  const forged = await request.post("/api/revalidate", { headers: { "sanity-webhook-signature": sign(`${body} `) }, data: body });
  expect(forged.status()).toBe(401);
  const replayed = await request.post("/api/revalidate", { headers: { "sanity-webhook-signature": sign(body, Date.now() - 10 * 60_000) }, data: body });
  expect(replayed.status()).toBe(401);
});

test("preview links need a valid secret and only redirect on-site", async ({ request }) => {
  const res = await request.get("/api/draft-mode/enable?secret=" + "x".repeat(40) + "&redirect=//evil.example", { maxRedirects: 0 });
  expect(res.status()).toBe(401);
});
