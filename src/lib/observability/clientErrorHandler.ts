import { clientErrorSchema } from "@/lib/observability/clientErrorSchema";
import { logger as defaultLogger, type Logger } from "@/lib/observability/logger";
import { sendAlert as defaultSendAlert, type AlertSender } from "@/lib/observability/alert";
import { redactText, safeUrl } from "@/lib/observability/redact";
import { readBody } from "@/lib/security/body";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit, clientIp, MemoryRateLimitStore, type RateLimitStore } from "@/lib/security/rateLimit";

const MAX_BODY_BYTES = 8 * 1024;

const empty = (status: number, headers: Record<string, string> = {}) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Collapses numbers and hex IDs so the same bug always gets the same fingerprint. */
export function errorFingerprint(message: string): string {
  return redactText(message)
    .replace(/\b[0-9a-f]{8,}\b/gi, "#")
    .replace(/\d+/g, "#")
    .slice(0, 120);
}

/**
 * POST /api/client-error: error beacons from visitors' browsers.
 *
 * Same-origin only (beacons from this site's pages), small typed bodies,
 * rate limited per IP. Every report is logged as `client.error`.
 *
 * Alerts go out only for a page that failed to render in the browser
 * (`kind: "boundary"` without a digest). Boundary errors *with* a digest
 * started on the server and were already alerted by instrumentation, and
 * stray unhandled errors are logged for review rather than paging anyone.
 */
export function createClientErrorHandler({
  env = process.env,
  logger = defaultLogger,
  alert = defaultSendAlert,
  store = new MemoryRateLimitStore(),
  now = Date.now,
  max = 10,
  windowMs = 60_000,
}: {
  env?: NodeJS.ProcessEnv;
  logger?: Logger;
  alert?: AlertSender;
  store?: RateLimitStore;
  now?: () => number;
  max?: number;
  windowMs?: number;
} = {}) {
  return async function POST(request: Request): Promise<Response> {
    if (!isAllowedOrigin(request, env)) return empty(403);
    if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) return empty(415);

    const limit = await checkRateLimit(store, `client-error:${clientIp(request.headers)}`, { max, windowMs, now: now() });
    if (!limit.allowed) return empty(429, { "Retry-After": String(limit.retryAfterSeconds) });

    const body = await readBody(request, MAX_BODY_BYTES);
    if (!body.ok) return empty(body.status);

    let raw: unknown;
    try {
      raw = JSON.parse(body.text);
    } catch {
      return empty(400);
    }
    const parsed = clientErrorSchema.safeParse(raw);
    if (!parsed.success) return empty(422);

    const report = parsed.data;
    const fields = {
      event: "client.error",
      kind: report.kind,
      errorMessage: redactText(report.message),
      digest: report.digest,
      path: safeUrl(report.path),
      locale: report.locale,
      source: safeUrl(report.source),
      line: report.line,
      column: report.column,
      stack: report.stack ? redactText(report.stack) : undefined,
      userAgent: request.headers.get("user-agent")?.slice(0, 200),
    };
    logger.error("Browser error", fields);

    if (report.kind === "boundary" && !report.digest) {
      await alert({
        fingerprint: `client-error:${errorFingerprint(report.message)}`,
        severity: "warning",
        title: `A page failed to display in a visitor's browser (${fields.path ?? "unknown page"})`,
        details: { errorMessage: fields.errorMessage, source: fields.source, line: fields.line, userAgent: fields.userAgent },
      });
    }
    return empty(204);
  };
}
