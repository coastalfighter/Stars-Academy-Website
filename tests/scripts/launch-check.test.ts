import { report, runLaunchCheck, visibleText } from "../../scripts/launch-check.mjs";
import { LEGACY_REDIRECTS } from "@/lib/launch/legacyRedirects";

const ORIGIN = "https://www.stars.test";
const HEADERS = {
  "content-security-policy": "default-src 'self'",
  "strict-transport-security": "max-age=63072000",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
};

type Faults = { brokenRedirect?: boolean; placeholder?: boolean; noindex?: boolean; noHeaders?: boolean; apexNotRedirected?: boolean; degraded?: boolean };

/** A tiny in-memory copy of the site, with optional faults. */
function fakeSite(f: Faults = {}) {
  const page = (path: string, lang: string, body = "Welcome") =>
    `<html lang="${lang}"><head><link rel="canonical" href="${ORIGIN}${path}"/>${f.noindex && path === "/faq" ? '<meta name="robots" content="noindex"/>' : ""}</head><body>${body}${f.placeholder && path === "/faq" ? " [Client to confirm]" : ""}<script>var TODO = 1;</script></body></html>`;
  const pages: Record<string, string> = {
    "/": page("/", "en-US"),
    "/faq": page("/faq", "en-US"),
    "/es": page("/es", "es-US"),
    "/about-us": page("/about-us", "en-US"),
    "/contact-us": page("/contact-us", "en-US"),
    "/schedule-a-tour": page("/schedule-a-tour", "en-US"),
  };
  for (const r of LEGACY_REDIRECTS) pages[r.to] ??= page(r.to, "en-US");

  return vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input);
    const manual = init?.redirect === "manual";
    const respond = (body: string, status = 200, extra: Record<string, string> = {}, finalUrl = url.href) => {
      const res = new Response(body, { status, headers: { "content-type": "text/html", ...(f.noHeaders ? {} : HEADERS), ...extra } });
      Object.defineProperty(res, "url", { value: finalUrl });
      return res;
    };
    if (url.origin !== ORIGIN) {
      if (f.apexNotRedirected && url.hostname === "stars.test") return respond("old wix site", 200);
      return respond(pages[url.pathname] ?? "", 200, {}, `${ORIGIN}${url.pathname}`);
    }
    const legacy = LEGACY_REDIRECTS.find((r) => r.from === url.pathname);
    if (legacy) {
      const to = f.brokenRedirect && legacy.from === "/enroll-now" ? "/" : legacy.to;
      return manual ? respond("", 308, { location: to }) : respond(pages[to] ?? "", 200, {}, `${ORIGIN}${to}`);
    }
    if (url.pathname === "/robots.txt") return respond(`User-agent: *\nDisallow: /api/\nSitemap: ${ORIGIN}/sitemap.xml`);
    if (url.pathname === "/sitemap.xml") return respond(["/", "/faq", "/es"].map((p) => `<url><loc>${ORIGIN}${p}</loc></url>`).join(""));
    if (url.pathname === "/api/health") {
      return Response.json(
        f.degraded
          ? { status: "degraded", checks: { inquiryDelivery: "missing" } }
          : { status: "ok", checks: { inquiryDelivery: "configured", rateLimit: "shared", analytics: "shared", alerts: "on" } },
        { status: f.degraded ? 503 : 200 },
      );
    }
    const html = pages[url.pathname];
    return html ? respond(html) : respond("Not found", 404);
  }) as unknown as typeof fetch;
}

const run = (f: Faults = {}) => runLaunchCheck(`${ORIGIN}/`, { fetchImpl: fakeSite(f), checkHosts: true });
const failures = async (f: Faults) => (await run(f)).filter((x) => !x.ok && x.severity === "error").map((x) => x.message);

describe("launch check", () => {
  it("passes a correctly launched site", async () => {
    const findings = await run();
    expect(findings.filter((x) => !x.ok)).toEqual([]);
    expect(report(findings)).toMatchObject({ failed: 0, warnings: 0 });
    expect(report(findings).text).toContain("Ready: no blocking problems.");
  });

  it.each([
    [{ brokenRedirect: true }, /\/enroll-now should redirect permanently to \/getting-started/],
    [{ placeholder: true }, /\/faq: placeholder text: unresolved client question/],
    [{ noindex: true }, /\/faq: marked noindex/],
    [{ noHeaders: true }, /content-security-policy header/],
    [{ apexNotRedirected: true }, /https:\/\/stars\.test\/ → https:\/\/stars\.test\//],
    [{ degraded: true }, /inquiry delivery is configured/],
  ] as const)("catches %o", async (fault, message) => {
    const found = await failures(fault);
    expect(found.some((m) => message.test(m)), found.join("\n")).toBe(true);
  });

  it("reads only visible text, so code in scripts isn't mistaken for placeholders", () => {
    expect(visibleText("<p>Hello</p><script>var TODO=1</script><style>.x{}</style>")).toBe(" Hello ");
  });
});
