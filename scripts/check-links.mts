/**
 * Checks the external links in the bundled resource library.
 *
 *   npm run check:links
 *
 * Exits 1 only for links that are definitely broken (404/410, DNS failure,
 * TLS error). Sites behind bot protection often refuse automated checks
 * (401/403/429); those are reported as "unverified" for a person to open.
 * Dependency-free: Node 22 runs this TypeScript directly.
 */
import { bundledResources } from "../src/content/resources.ts";

export type LinkStatus = "ok" | "unverified" | "broken";
export type LinkResult = { url: string; status: LinkStatus; detail: string };

const BLOCKED = new Set([401, 403, 405, 429, 451, 503]);

export function classify(code: number): LinkStatus {
  if (code >= 200 && code < 400) return "ok";
  if (BLOCKED.has(code)) return "unverified";
  return "broken";
}

export async function checkLink(url: string, fetchImpl: typeof fetch = fetch): Promise<LinkResult> {
  try {
    const res = await fetchImpl(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; STARS-link-check)" },
      signal: AbortSignal.timeout(20_000),
    });
    return { url, status: classify(res.status), detail: `HTTP ${res.status}` };
  } catch (error) {
    return { url, status: "broken", detail: error instanceof Error ? error.message : String(error) };
  }
}

export function externalLinks(): string[] {
  const urls = bundledResources.flatMap((r) => ("route" in r.target ? [] : [r.target.en, r.target.es])).filter((u): u is string => Boolean(u));
  return [...new Set(urls)];
}

async function main(): Promise<void> {
  const results = await Promise.all(externalLinks().map((u) => checkLink(u)));
  const icon: Record<LinkStatus, string> = { ok: "✅", unverified: "⚠️ ", broken: "❌" };
  for (const r of results) console.log(`${icon[r.status]} ${r.detail.padEnd(10)} ${r.url}`);
  if (results.some((r) => r.status === "broken")) process.exitCode = 1;
}

if (import.meta.url === new URL(process.argv[1] ?? "", "file://").href) {
  void main();
}
