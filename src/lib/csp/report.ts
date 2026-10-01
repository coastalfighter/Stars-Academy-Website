import { safeUrl } from "@/lib/observability/redact";

/**
 * Normalises Content-Security-Policy violation reports.
 *
 * Browsers send two formats:
 *  - Reporting API (`application/reports+json`): an array of
 *    `{ type: "csp-violation", body: { documentURL, blockedURL, effectiveDirective, … } }`.
 *  - Legacy `report-uri` (`application/csp-report`):
 *    `{ "csp-report": { "document-uri", "blocked-uri", "violated-directive", … } }`.
 *
 * Both become one shape with URLs reduced to origin + path. Script samples
 * are dropped (they can echo page content), and violations caused by browser
 * extensions, which the site can't fix, are filtered out as noise.
 */

export type CspViolation = {
  document?: string;
  blocked: string;
  directive: string;
  disposition: "enforce" | "report";
  sourceFile?: string;
  line?: number;
  column?: number;
};

export const CSP_CONTENT_TYPES = ["application/reports+json", "application/csp-report", "application/json"] as const;
export const MAX_REPORTS_PER_REQUEST = 20;

const EXTENSION_SCHEMES = /^(chrome|moz|safari|safari-web|ms-browser|edge)-extension|^webkit-masked-url/i;
const KEYWORDS = new Set(["inline", "eval", "wasm-eval", "trusted-types-policy", "trusted-types-sink", "self", "data", "blob"]);

type Raw = Record<string, unknown>;

const str = (v: unknown): string | undefined => (typeof v === "string" && v.length > 0 ? v : undefined);
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : undefined);

function blockedValue(raw: string | undefined): string {
  if (!raw) return "unknown";
  const lower = raw.toLowerCase();
  if (KEYWORDS.has(lower)) return lower;
  return safeUrl(raw) ?? "unknown";
}

function fromFields(f: {
  document?: string;
  blocked?: string;
  directive?: string;
  disposition?: string;
  sourceFile?: string;
  line?: unknown;
  column?: unknown;
}): CspViolation | null {
  if (!f.directive) return null;
  if ((f.blocked && EXTENSION_SCHEMES.test(f.blocked)) || (f.sourceFile && EXTENSION_SCHEMES.test(f.sourceFile))) return null;
  const directive = f.directive.split(/\s+/)[0]!.toLowerCase().slice(0, 40);
  if (!/^[a-z-]+$/.test(directive)) return null;
  return {
    document: safeUrl(f.document),
    blocked: blockedValue(f.blocked),
    directive,
    disposition: f.disposition === "report" ? "report" : "enforce",
    sourceFile: safeUrl(f.sourceFile),
    line: num(f.line),
    column: num(f.column),
  };
}

function fromReportingApi(entry: unknown): CspViolation | null {
  if (typeof entry !== "object" || entry === null) return null;
  const e = entry as Raw;
  if (e.type !== "csp-violation" || typeof e.body !== "object" || e.body === null) return null;
  const b = e.body as Raw;
  return fromFields({
    document: str(b.documentURL) ?? str(e.url),
    blocked: str(b.blockedURL),
    directive: str(b.effectiveDirective) ?? str(b.violatedDirective),
    disposition: str(b.disposition),
    sourceFile: str(b.sourceFile),
    line: b.lineNumber,
    column: b.columnNumber,
  });
}

function fromLegacy(payload: unknown): CspViolation | null {
  if (typeof payload !== "object" || payload === null) return null;
  const r = (payload as Raw)["csp-report"];
  if (typeof r !== "object" || r === null) return null;
  const b = r as Raw;
  return fromFields({
    document: str(b["document-uri"]),
    blocked: str(b["blocked-uri"]),
    directive: str(b["effective-directive"]) ?? str(b["violated-directive"]),
    disposition: str(b.disposition),
    sourceFile: str(b["source-file"]),
    line: b["line-number"],
    column: b["column-number"],
  });
}

/** Returns the actionable violations in a report body (possibly none). */
export function parseCspReports(payload: unknown): CspViolation[] {
  const entries = Array.isArray(payload) ? payload.slice(0, MAX_REPORTS_PER_REQUEST).map(fromReportingApi) : [fromLegacy(payload)];
  return entries.filter((v): v is CspViolation => v !== null);
}
