import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";
import { CMS_PROJECT_ID, INSIGHTS_PASSWORD, INSIGHTS_SESSION_SECRET, PORTS, RECEIVER_URL, SANITY_WEBHOOK_SECRET, WEBHOOK_SECRET } from "./e2e/env";

/**
 * End-to-end suite, in two modes.
 *
 * Local (default): run `npm run e2e:build` once, then `npm run e2e`. Three
 * servers start automatically: the site, a CMS-enabled copy (Sanity mocked),
 * and a webhook receiver that captures delivered inquiries.
 *
 * Remote: `E2E_BASE_URL=https://… npm run e2e` tests a deployed site (used
 * for every Vercel preview). No servers start; the CMS project and tests
 * tagged `@local` (real inquiry delivery) are skipped. For protected
 * previews, VERCEL_AUTOMATION_BYPASS_SECRET is sent as Vercel's bypass header.
 */
const CI = Boolean(process.env.CI);
const REMOTE = process.env.E2E_BASE_URL?.replace(/\/$/, "");
const next = resolve("node_modules/next/dist/bin/next");

// WebGL in headless Chromium (needed for the 3D scene). A preinstalled browser
// can be used via PLAYWRIGHT_CHROMIUM_EXECUTABLE (e.g. in sandboxed dev envs).
const launchOptions = {
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
};

const siteEnv = {
  NODE_ENV: "production",
  INQUIRY_WEBHOOK_URL: `${RECEIVER_URL}/hook`,
  INQUIRY_WEBHOOK_SECRET: WEBHOOK_SECRET,
  RATE_LIMIT_MAX: "1000",
  INSIGHTS_PASSWORD,
  INSIGHTS_SESSION_SECRET,
};

const site = REMOTE ?? `http://127.0.0.1:${PORTS.site}`;
const cms = `http://127.0.0.1:${PORTS.cms}`;
const general = /(smoke|a11y|story|calm|i18n|forms|keyboard|analytics|community|enroll)\.spec\.ts/;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  ...(REMOTE ? { grepInvert: /@local/ } : {}),
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions,
    ...(REMOTE
      ? {
          extraHTTPHeaders: {
            // Vercel's preview toolbar injects a third-party script; keep it out of the tests.
            "x-vercel-skip-toolbar": "1",
            ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET
              ? { "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
              : {}),
          },
        }
      : {}),
  },
  projects: [
    { name: "desktop", testMatch: general, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, baseURL: site } },
    { name: "mobile", testMatch: general, use: { ...devices["Pixel 7"], baseURL: site } },
    { name: "reduced-motion", testMatch: /calm\.spec\.ts/, use: { ...devices["Desktop Chrome"], reducedMotion: "reduce", baseURL: site } },
    ...(REMOTE ? [] : [{ name: "cms", testMatch: /cms\.spec\.ts/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, baseURL: cms } }]),
  ],
  webServer: REMOTE ? undefined : [
    {
      command: `node e2e/fixtures/webhook-receiver.mjs`,
      url: `${RECEIVER_URL}/health`,
      reuseExistingServer: !CI,
      timeout: 20_000,
    },
    {
      command: `node ${next} start -p ${PORTS.site} -H 127.0.0.1`,
      url: site,
      env: siteEnv,
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
    {
      command: `node --require ./e2e/fixtures/mock-sanity.cjs ${next} start -p ${PORTS.cms} -H 127.0.0.1`,
      url: cms,
      env: {
        ...siteEnv,
        NEXT_DIST_DIR: ".next-cms",
        SANITY_PROJECT_ID: CMS_PROJECT_ID,
        SANITY_WEBHOOK_SECRET,
        SECURE_FORM_HOSTS: ".securefiles.test",
        TEXT_ALERTS_MODE: "dry-run",
      },
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
  ],
});
