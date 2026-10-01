/**
 * Lighthouse CI: category scores and resource budgets for the key templates.
 *
 * Runs against the production build (`npm run build` first) with Lighthouse's
 * default mobile profile (Moto G Power, slow 4G, 4× CPU throttle), the
 * toughest realistic audience: caregivers on phones.
 *
 * Thresholds were calibrated on real runs of this build and leave ~20%
 * headroom (measured medians: performance 0.86–0.95, LCP 3.0–3.9 s,
 * TBT 50–175 ms, CLS 0, JS ≤ 323 KB, total ≤ 560 KB). Tighten them as the
 * site gets faster; never loosen them to make a regression pass.
 *
 *   CHROME_PATH=/path/to/chrome npm run lhci
 */
const PORT = Number(process.env.LHCI_PORT || 3300);
const base = `http://localhost:${PORT}`;

/** Representative templates: home (3D), service detail, long-form, form, gallery, Spanish. */
const urls = [
  "/",
  "/services/speech-therapy",
  "/families",
  "/faq",
  "/schedule-a-tour",
  "/photos",
  "/es",
  "/es/servicios/terapia-del-habla-y-lenguaje",
].map((path) => `${base}${path}`);

/**
 * Kilobytes transferred (compressed) during page load. The three.js chunk is
 * excluded by design: it loads after idle, and only on devices with a GPU.
 */
const budgets = {
  script: 380,
  stylesheet: 25,
  font: 170,
  image: 250,
  total: 700,
};

const budget = (kb) => ["error", { maxNumericValue: kb * 1024 }];

module.exports = {
  ci: {
    collect: {
      startServerCommand: `npx next start -p ${PORT}`,
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 60000,
      url: urls,
      numberOfRuns: Number(process.env.LHCI_RUNS || 3),
      settings: {
        // Containers run as root without a user namespace for the sandbox.
        chromeFlags: "--no-sandbox --headless=new",
        // HTTP/2 and bfcache depend on the host (Vercel provides both), not the app.
        skipAudits: ["uses-http2", "bf-cache"],
      },
    },
    assert: {
      // Median of the runs is asserted, which smooths CPU noise.
      aggregationMethod: "median-run",
      assertions: {
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:performance": ["error", { minScore: 0.8 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4500 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
        "resource-summary:script:size": budget(budgets.script),
        "resource-summary:stylesheet:size": budget(budgets.stylesheet),
        "resource-summary:font:size": budget(budgets.font),
        "resource-summary:image:size": budget(budgets.image),
        "resource-summary:total:size": budget(budgets.total),
        "resource-summary:third-party:count": ["error", { maxNumericValue: 0 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
