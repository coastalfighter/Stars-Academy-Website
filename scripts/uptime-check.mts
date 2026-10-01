/**
 * Production uptime probe, run on a schedule by .github/workflows/uptime.yml.
 *
 *   node scripts/uptime-check.mts https://www.mystarsacademy.org
 *
 * Dependency-free (Node 22 runs this TypeScript directly), so the workflow
 * needs no `npm ci`. Each check retries before failing, so a single blip
 * doesn't raise an alarm. Exits 1 when the site is down or degraded, which
 * fails the workflow run and notifies the repository's watchers.
 * Optional: ALERT_WEBHOOK_URL posts the failure to chat as well.
 */

export type CheckResult = { name: string; url: string; ok: boolean; status?: number; ms: number; problem?: string };

type Check = { name: string; path: string; expect: (res: Response, body: string) => string | null };

export const CHECKS: Check[] = [
  {
    name: "health",
    path: "/api/health",
    expect: (res, body) => {
      if (res.status !== 200) return `HTTP ${res.status}`;
      try {
        const data = JSON.parse(body) as { status?: string; checks?: Record<string, string> };
        if (data.status !== "ok") return `status "${data.status ?? "missing"}" (${JSON.stringify(data.checks ?? {})})`;
        return null;
      } catch {
        return "health response was not JSON";
      }
    },
  },
  { name: "home (English)", path: "/", expect: (res, body) => (res.status !== 200 ? `HTTP ${res.status}` : body.includes("STARS") ? null : "page content missing") },
  { name: "home (Spanish)", path: "/es", expect: (res, body) => (res.status !== 200 ? `HTTP ${res.status}` : body.includes('lang="es-US"') ? null : "page content missing") },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runChecks(
  baseUrl: string,
  { fetchImpl = fetch, attempts = 3, retryDelayMs = 10_000, timeoutMs = 15_000, slowMs = 5_000 } = {},
): Promise<CheckResult[]> {
  const base = new URL(baseUrl);
  if (base.protocol !== "https:" && base.hostname !== "localhost" && base.hostname !== "127.0.0.1") {
    throw new Error("Production URL must use https");
  }
  const results: CheckResult[] = [];
  for (const check of CHECKS) {
    const url = new URL(check.path, base).toString();
    let result: CheckResult = { name: check.name, url, ok: false, ms: 0, problem: "not run" };
    for (let attempt = 1; attempt <= attempts; attempt++) {
      const started = Date.now();
      try {
        const res = await fetchImpl(url, { redirect: "follow", signal: AbortSignal.timeout(timeoutMs), headers: { "User-Agent": "stars-uptime-check" } });
        const body = await res.text();
        const ms = Date.now() - started;
        const problem = check.expect(res, body);
        result = { name: check.name, url, ok: problem === null, status: res.status, ms, ...(problem ? { problem } : {}) };
        if (result.ok && ms > slowMs) result.problem = `slow (${ms} ms)`;
      } catch (error) {
        result = { name: check.name, url, ok: false, ms: Date.now() - started, problem: error instanceof Error ? error.message : String(error) };
      }
      if (result.ok) break;
      if (attempt < attempts) await sleep(retryDelayMs);
    }
    results.push(result);
  }
  return results;
}

export function summarize(results: CheckResult[]): string {
  return results
    .map((r) => `${r.ok ? (r.problem ? "⚠️" : "✅") : "❌"} ${r.name}: ${r.ok ? `${r.status} in ${r.ms} ms` : r.problem}${r.ok && r.problem ? ` (${r.problem})` : ""}`)
    .join("\n");
}

async function main(): Promise<void> {
  const target = process.argv[2] ?? process.env.PRODUCTION_URL;
  if (!target) {
    console.log("No production URL configured (set the PRODUCTION_URL repository variable). Skipping.");
    return;
  }
  const results = await runChecks(target);
  const report = summarize(results);
  console.log(report);
  const down = results.filter((r) => !r.ok);
  if (down.length === 0) return;

  if (process.env.ALERT_WEBHOOK_URL) {
    await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `🔴 [STARS website · uptime] ${target} is failing checks\n${report}`, event: { type: "uptime", target, results } }),
      signal: AbortSignal.timeout(5_000),
    }).catch((error: unknown) => console.error("Alert webhook failed:", error));
  }
  process.exitCode = 1;
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file://").href) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
