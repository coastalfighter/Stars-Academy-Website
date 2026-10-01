/**
 * Browser → server error beacons (POST /api/client-error).
 *
 * Deliberately dependency-free: this runs on every page, so it clamps fields
 * by hand instead of shipping a validation library. The endpoint validates
 * strictly (clientErrorSchema.ts). Payloads are descriptive only: what broke
 * and where, never what the visitor typed.
 */

export const CLIENT_ERROR_PATH = "/api/client-error";

export type ClientErrorReport = {
  kind: "boundary" | "unhandled" | "rejection";
  message: string;
  digest?: string;
  path: string;
  locale: "en" | "es";
  source?: string;
  line?: number;
  column?: number;
  stack?: string;
};

const text = (v: string | undefined, max: number) => (v ? v.slice(0, max) : undefined);
const position = (v: number | undefined) => (typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 10_000_000 ? v : undefined);

/** Fits a report to the endpoint's limits so it isn't rejected for length. */
export function normalizeReport(r: ClientErrorReport): ClientErrorReport {
  return {
    kind: r.kind,
    message: r.message.slice(0, 500),
    digest: r.digest && /^[\w-]{1,64}$/.test(r.digest) ? r.digest : undefined,
    path: r.path.startsWith("/") ? r.path.slice(0, 300) : "/",
    locale: r.locale,
    source: text(r.source, 300),
    line: position(r.line),
    column: position(r.column),
    stack: text(r.stack, 2_000),
  };
}

const MAX_PER_PAGE = 5;
const sent = new Set<string>();

/** Path only: query strings and fragments can carry personal data. */
export function currentPath(): string {
  try {
    return window.location.pathname.slice(0, 300) || "/";
  } catch {
    return "/";
  }
}

/**
 * Sends one report, at most once per distinct message and at most five per
 * page view. Uses `sendBeacon` so reports survive the page being closed.
 * Never throws: reporting must not cause a second error.
 */
export function reportClientError(report: ClientErrorReport): boolean {
  try {
    const key = `${report.kind}:${report.digest ?? report.message}`;
    if (sent.has(key) || sent.size >= MAX_PER_PAGE) return false;
    sent.add(key);

    const body = JSON.stringify(normalizeReport(report));
    const blob = new Blob([body], { type: "application/json" });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function" && navigator.sendBeacon(CLIENT_ERROR_PATH, blob)) {
      return true;
    }
    void fetch(CLIENT_ERROR_PATH, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
    return true;
  } catch {
    return false;
  }
}

/** Test helper: forget what was sent. */
export function resetClientReports(): void {
  sent.clear();
}
