/**
 * Launch verification for a live deployment.
 *
 *   node scripts/launch-check.mts https://www.mystarsacademy.org
 *   npm run launch:check -- https://www.mystarsacademy.org
 *
 * Checks what a careful person would check on launch day, on every page:
 *   - www / apex / http variants all end on the canonical https host
 *   - every page of the old site redirects (308) to the right new page
 *   - every sitemap URL answers 200 on the canonical host, with a matching
 *     canonical link, the right <html lang>, no "noindex" and no placeholder text
 *   - robots.txt, security headers, a real 404, the health check
 *
 * Exits 1 when anything is wrong; warnings (e.g. alerts not configured) are
 * printed but don't fail. Dependency-free: Node 22 runs this TypeScript directly.
 */
import { LEGACY_REDIRECTS, LEGACY_UNCHANGED } from "../src/lib/launch/legacyRedirects.ts";
import { findPlaceholders } from "../src/lib/launch/placeholders.ts";

export type Severity = "error" | "warn";
export type Finding = { group: string; ok: boolean; severity: Severity; message: string };

type Fetch = typeof fetch;
type Options = { fetchImpl?: Fetch; concurrency?: number; timeoutMs?: number; checkHosts?: boolean };

const REQUIRED_HEADERS = ["content-security-policy", "strict-transport-security", "x-content-type-options", "x-frame-options", "referrer-policy"];

async function pool<T, R>(items: readonly T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  });
  await Promise.all(workers);
  return out;
}

/** Visible text of an HTML page (scripts, styles and tags removed). */
export function visibleText(html: string): string {
  return html
    .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

const attr = (html: string, re: RegExp) => re.exec(html)?.[1] ?? null;

export async function runLaunchCheck(baseUrl: string, { fetchImpl = fetch, concurrency = 6, timeoutMs = 20_000, checkHosts }: Options = {}): Promise<Finding[]> {
  const base = new URL(baseUrl);
  const origin = base.origin;
  const findings: Finding[] = [];
  const add = (group: string, ok: boolean, message: string, severity: Severity = "error") => findings.push({ group, ok, severity, message });
  const get = (url: string, redirect: RequestRedirect = "follow") =>
    fetchImpl(url, { redirect, headers: { "User-Agent": "stars-launch-check" }, signal: AbortSignal.timeout(timeoutMs) });

  // 1. Hosts: http → https, apex ↔ www, all ending on the canonical origin.
  const isPublicDomain = base.protocol === "https:" && !/localhost|127\.0\.0\.1|vercel\.app$/.test(base.hostname);
  if (checkHosts ?? isPublicDomain) {
    const apex = base.hostname.replace(/^www\./, "");
    const variants = [`http://${base.hostname}/`, `https://${apex}/`, `http://${apex}/`, `https://www.${apex}/`].filter((v) => v !== `${origin}/`);
    for (const v of [...new Set(variants)]) {
      try {
        const res = await get(v);
        add("hosts", res.ok && new URL(res.url).origin === origin, `${v} → ${res.url} (${res.status})`);
      } catch (e) {
        add("hosts", false, `${v}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  // 2. Old-site URLs.
  await pool(LEGACY_REDIRECTS, concurrency, async (r) => {
    try {
      const first = await get(`${origin}${r.from}`, "manual");
      const location = first.headers.get("location");
      const target = location ? new URL(location, origin) : null;
      const permanent = first.status === 301 || first.status === 308;
      const right = target !== null && target.origin === origin && target.pathname === r.to;
      if (!permanent || !right) {
        add("old-site", false, `${r.from} should redirect permanently to ${r.to}; got ${first.status} ${location ?? ""}`);
        return;
      }
      const final = await get(`${origin}${r.from}`);
      add("old-site", final.status === 200, `${r.from} → ${r.to} (${final.status})`);
    } catch (e) {
      add("old-site", false, `${r.from}: ${e instanceof Error ? e.message : String(e)}`);
    }
  });
  await pool(LEGACY_UNCHANGED, concurrency, async (path) => {
    const res = await get(`${origin}${path}`).catch(() => null);
    add("old-site", res?.status === 200, `${path} still answers (${res?.status ?? "no response"})`);
  });

  // 3. robots.txt and the sitemap.
  const robots = await get(`${origin}/robots.txt`).then((r) => r.text()).catch(() => "");
  add("robots", /Sitemap:\s*\S+\/sitemap\.xml/.test(robots), "robots.txt points at the sitemap");
  add("robots", !/^Disallow:\s*\/\s*$/m.test(robots), "robots.txt allows the site to be indexed");

  const sitemap = await get(`${origin}/sitemap.xml`).then((r) => r.text()).catch(() => "");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!.trim());
  add("sitemap", locs.length > 0, `sitemap lists ${locs.length} pages`);
  const offHost = locs.filter((l) => new URL(l).origin !== origin);
  add("sitemap", offHost.length === 0, offHost.length ? `sitemap URLs use another host (check NEXT_PUBLIC_SITE_URL): ${offHost[0]}` : "sitemap URLs use the canonical host");

  // 4. Every page.
  await pool(locs, concurrency, async (loc) => {
    const url = `${origin}${new URL(loc).pathname}`;
    try {
      const res = await get(url);
      const html = await res.text();
      const path = new URL(loc).pathname;
      const problems: string[] = [];
      if (res.status !== 200) problems.push(`HTTP ${res.status}`);
      const canonical = attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) ?? attr(html, /<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i);
      if (canonical !== loc) problems.push(`canonical is ${canonical ?? "missing"}`);
      const lang = attr(html, /<html[^>]+lang="([^"]+)"/i);
      const wantLang = path === "/es" || path.startsWith("/es/") ? "es-US" : "en-US";
      if (lang !== wantLang) problems.push(`lang="${lang}"`);
      if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html) || (res.headers.get("x-robots-tag") ?? "").includes("noindex")) problems.push("marked noindex");
      const placeholders = findPlaceholders(visibleText(html));
      if (placeholders.length) problems.push(`placeholder text: ${placeholders.join(", ")}`);
      add("pages", problems.length === 0, problems.length ? `${path}: ${problems.join("; ")}` : `${path} OK`);
    } catch (e) {
      add("pages", false, `${loc}: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  // 5. Headers, 404, health.
  const home = await get(`${origin}/`).catch(() => null);
  for (const h of REQUIRED_HEADERS) add("security", Boolean(home?.headers.get(h)), `${h} header`);
  const missing = await get(`${origin}/this-page-does-not-exist-${Date.now()}`).catch(() => null);
  add("errors", missing?.status === 404, `unknown pages return 404 (${missing?.status ?? "no response"})`);

  const health = await get(`${origin}/api/health`)
    .then(async (r) => ({ status: r.status, body: (await r.json()) as { status?: string; checks?: Record<string, string> } }))
    .catch(() => null);
  add("health", health?.status === 200 && health.body.status === "ok", `health check: ${health ? `${health.status} ${health.body.status}` : "unreachable"}`);
  const checks = health?.body.checks ?? {};
  add("health", checks.inquiryDelivery === "configured", "inquiry delivery is configured");
  add("health", checks.rateLimit === "shared", `rate limiting is ${checks.rateLimit ?? "unknown"} (shared needs Upstash)`, "warn");
  add("health", checks.analytics === "shared", `website insights storage is ${checks.analytics ?? "unknown"}`, "warn");
  add("health", checks.alerts === "on", `alerts are ${checks.alerts ?? "unknown"} (set ALERT_WEBHOOK_URL)`, "warn");

  return findings;
}

export function report(findings: Finding[]): { text: string; failed: number; warnings: number } {
  const failed = findings.filter((f) => !f.ok && f.severity === "error").length;
  const warnings = findings.filter((f) => !f.ok && f.severity === "warn").length;
  const groups = [...new Set(findings.map((f) => f.group))];
  const lines: string[] = [];
  for (const g of groups) {
    const items = findings.filter((f) => f.group === g);
    const bad = items.filter((f) => !f.ok);
    lines.push(`${bad.some((f) => f.severity === "error") ? "❌" : bad.length ? "⚠️ " : "✅"} ${g}: ${items.length - bad.length}/${items.length} OK`);
    for (const f of bad) lines.push(`    ${f.severity === "error" ? "✗" : "!"} ${f.message}`);
  }
  lines.push("", failed ? `${failed} problem(s) must be fixed before launch.` : "Ready: no blocking problems.", ...(warnings ? [`${warnings} warning(s) to review.`] : []));
  return { text: lines.join("\n"), failed, warnings };
}

async function main(): Promise<void> {
  const target = process.argv[2] ?? process.env.PRODUCTION_URL;
  if (!target) {
    console.error("Usage: node scripts/launch-check.mts https://www.mystarsacademy.org");
    process.exitCode = 2;
    return;
  }
  const { text, failed } = report(await runLaunchCheck(target));
  console.log(text);
  if (failed) process.exitCode = 1;
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file://").href) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
