import { expect, type APIRequestContext, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Every page path listed in the sitemap (both languages). */
export async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const xml = await (await request.get("/sitemap.xml")).text();
  return [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname))];
}

export const isSpanish = (path: string) => path === "/es" || path.startsWith("/es/");

/** Collects console errors and failed same-origin requests while a test runs. */
export function watchForErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  page.on("response", (r) => {
    const url = new URL(r.url());
    if (r.status() >= 400 && url.host === new URL(page.url() || r.url()).host) errors.push(`${r.status()} ${url.pathname}`);
  });
  return errors;
}

/** Fails on any serious or critical WCAG 2.2 A/AA violation. */
export async function expectAccessible(page: Page, testInfo: TestInfo, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    // The WebGL canvas is decorative (aria-hidden) and can't be colour-analysed.
    .exclude("canvas")
    .analyze();
  const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  if (blocking.length) {
    await testInfo.attach(`axe-${label}.json`, { body: JSON.stringify(blocking, null, 2), contentType: "application/json" });
  }
  expect(
    blocking.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`),
    `axe violations on ${label}`,
  ).toEqual([]);
}

/** Waits past the form's anti-bot minimum fill time (2.5 s) so a submission is really delivered. */
export const waitPastBotCheck = (page: Page) => page.waitForTimeout(2700);

/**
 * CI browsers have no GPU, so WebGL runs on a software rasteriser and the site
 * (correctly) serves its static backdrop. Specs that exercise the 3D scene opt
 * back in with the QA override.
 */
export async function force3d(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("stars:force-3d", "true");
    } catch {
      // Opaque origins (about:blank) have no storage; the next navigation does.
    }
  });
}
