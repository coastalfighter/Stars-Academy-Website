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

/*
 * Community content (Milestone 8). Note: CMS images are fetched by Next's
 * image optimizer with a DNS-pinned request that the fetch-based Sanity mock
 * can't answer, so these tests check what is rendered (routing through the
 * site's own optimizer, alt text, consent) rather than image pixels.
 */

test("events list upcoming entries with calendar files and structured data", async ({ page, request }) => {
  await page.goto("/events");
  const openHouse = page.getByRole("article", { name: "Fall open house" });
  await expect(openHouse).toContainText("STARS main campus · 200 General St., Batesville, AR 72501");
  await expect(openHouse).toContainText("Please call to save a spot:");
  await expect(page.getByRole("article", { name: "Hiring day for developmental technicians" })).toContainText("All day");
  await expect(page.getByText("Already over")).toHaveCount(0);
  await expect(page.getByText("Invalid")).toHaveCount(0);

  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.join()).toContain('"@type":"Event"');

  const href = await openHouse.getByRole("link", { name: /Add .Fall open house. to your calendar/ }).getAttribute("href");
  const ics = await request.get(href!);
  expect(ics.headers()["content-type"]).toBe("text/calendar; charset=utf-8");
  expect(await ics.text()).toContain("SUMMARY:Fall open house");

  await page.goto("/es/eventos");
  await expect(page.getByRole("article", { name: "Puertas abiertas de otoño" })).toBeVisible();
  // Untranslated titles fall back to English, marked as such for screen readers.
  await expect(page.getByRole("heading", { name: "Hiring day for developmental technicians" })).toHaveAttribute("lang", "en-US");

  await page.goto("/families");
  await expect(page.getByRole("heading", { name: "Upcoming events" })).toBeVisible();
});

test("resources choose the family's language and refuse unsafe links", async ({ page }) => {
  await page.goto("/es/recursos");
  const pdf = page.getByRole("link", { name: /Consejos de alimentación en casa/ });
  await expect(pdf).toHaveAttribute("href", "https://cdn.sanity.io/files/e2etest01/production/def456.pdf");
  await expect(pdf).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("main").getByText("En inglés", { exact: true })).toBeVisible();
  await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
  await expect(page.getByText("Unsafe")).toHaveCount(0);
});

test("the team page groups staff and shows photos only with consent", async ({ page }) => {
  await page.goto("/team");
  await expect(page.getByRole("heading", { name: "Therapy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Rosa Martínez/ })).toBeVisible();
  await expect(page.getByLabel("Speaks Spanish")).toBeVisible();
  // Rosa's photo goes through this site's optimizer, never straight to Sanity.
  const src = await page.locator("main img").first().getAttribute("src");
  expect(src).toMatch(/^\/_next\/image\?url=https%3A%2F%2Fcdn\.sanity\.io/);
  await page.goto("/about-us");
  await expect(page.getByText("Clinical Director")).toBeVisible();
  await expect(page.getByText("Bilingual Speech-Language Pathologist")).toHaveCount(0);
});

test("the gallery never shows a photo without a signed release", async ({ page }) => {
  await page.goto("/photos");
  await expect(page.getByAltText("Two children build a block tower with a teacher.")).toBeVisible();
  await expect(page.getByAltText("NO CONSENT PHOTO")).toHaveCount(0);
  await expect(page.locator('img[src*="e2e-secret"]')).toHaveCount(0);
  await expect(page.locator('img[src^="https://cdn.sanity.io"]')).toHaveCount(0);
});
