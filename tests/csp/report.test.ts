import { buildCsp, REPORTING_ENDPOINTS } from "@/lib/security/csp";
import { parseCspReports } from "@/lib/csp/report";
import { createCspReportHandler } from "@/lib/csp/handler";
import { createLogger } from "@/lib/observability/logger";
import { MemoryRateLimitStore } from "@/lib/security/rateLimit";

describe("CSP policy", () => {
  it("reports violations through both mechanisms and stays strict", () => {
    const csp = buildCsp();
    expect(csp).toContain("report-uri /api/csp-report");
    expect(csp).toContain("report-to csp");
    expect(csp).not.toContain("unsafe-eval");
    expect(REPORTING_ENDPOINTS).toBe('csp="/api/csp-report"');
    expect(buildCsp({ dev: true })).toContain("'unsafe-eval'");
  });
});

describe("parseCspReports", () => {
  it("normalises Reporting API batches and strips query strings", () => {
    const out = parseCspReports([
      {
        type: "csp-violation",
        url: "https://stars.test/contact-us?name=Jane",
        body: {
          documentURL: "https://stars.test/contact-us?name=Jane",
          blockedURL: "https://evil.test/x.js?token=1",
          effectiveDirective: "script-src-elem",
          disposition: "enforce",
          sourceFile: "https://stars.test/_next/static/chunks/a.js",
          lineNumber: 3,
          columnNumber: 7,
          sample: "secret page text",
        },
      },
      { type: "deprecation", body: {} },
    ]);
    expect(out).toEqual([
      {
        document: "https://stars.test/contact-us",
        blocked: "https://evil.test/x.js",
        directive: "script-src-elem",
        disposition: "enforce",
        sourceFile: "https://stars.test/_next/static/chunks/a.js",
        line: 3,
        column: 7,
      },
    ]);
    expect(JSON.stringify(out)).not.toContain("secret");
  });

  it("normalises legacy report-uri bodies and keyword sources", () => {
    expect(
      parseCspReports({
        "csp-report": { "document-uri": "https://stars.test/", "blocked-uri": "eval", "violated-directive": "script-src 'self'" },
      }),
    ).toEqual([{ document: "https://stars.test/", blocked: "eval", directive: "script-src", disposition: "enforce", sourceFile: undefined, line: undefined, column: undefined }]);
  });

  it("drops browser-extension noise and junk", () => {
    expect(parseCspReports({ "csp-report": { "blocked-uri": "chrome-extension://abc", "violated-directive": "script-src" } })).toEqual([]);
    expect(parseCspReports({ "csp-report": { "blocked-uri": "x", "violated-directive": "<script>" } })).toEqual([]);
    expect(parseCspReports("nope")).toEqual([]);
    expect(parseCspReports(Array.from({ length: 50 }, () => ({ type: "csp-violation", body: { effectiveDirective: "img-src" } })))).toHaveLength(20);
  });
});

describe("POST /api/csp-report", () => {
  function setup() {
    const lines: string[] = [];
    const logger = createLogger({ sink: (_l, line) => lines.push(line) });
    return { handler: createCspReportHandler({ logger, store: new MemoryRateLimitStore(), max: 2, now: () => 1000 }), lines };
  }
  const post = (body: string, type = "application/csp-report") =>
    new Request("https://stars.test/api/csp-report", { method: "POST", headers: { "content-type": type, "x-forwarded-for": "203.0.113.5" }, body });
  const legacy = JSON.stringify({ "csp-report": { "document-uri": "https://stars.test/faq", "blocked-uri": "inline", "violated-directive": "style-src" } });

  it("logs violations and answers 204", async () => {
    const { handler, lines } = setup();
    expect((await handler(post(legacy))).status).toBe(204);
    expect(JSON.parse(lines[0]!)).toMatchObject({ event: "csp.violation", directive: "style-src", blocked: "inline", level: "warn" });
  });

  it("rejects wrong types, bad JSON and floods", async () => {
    const { handler } = setup();
    expect((await handler(post(legacy, "text/plain"))).status).toBe(415);
    expect((await handler(post("{"))).status).toBe(400);
    await handler(post(legacy));
    expect((await handler(post(legacy))).status).toBe(429);
  });
});
