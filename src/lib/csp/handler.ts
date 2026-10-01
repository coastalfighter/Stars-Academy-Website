import { CSP_CONTENT_TYPES, parseCspReports } from "@/lib/csp/report";
import { logger as defaultLogger, type Logger } from "@/lib/observability/logger";
import { readBody } from "@/lib/security/body";
import { checkRateLimit, clientIp, MemoryRateLimitStore, type RateLimitStore } from "@/lib/security/rateLimit";

const MAX_BODY_BYTES = 32 * 1024;

const empty = (status: number, headers: Record<string, string> = {}) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store", ...headers } });

/**
 * POST /api/csp-report: receives violation reports from browsers and writes
 * them to the structured log (`event: "csp.violation"`).
 *
 * Reports arrive without credentials and may legitimately come from any page
 * a browser loaded, so there is no origin check; instead bodies are small,
 * typed, rate limited per IP, and reduced to non-identifying fields.
 * Rate limiting uses per-instance memory on purpose: this endpoint must not
 * spend the shared store's quota.
 */
export function createCspReportHandler({
  logger = defaultLogger,
  store = new MemoryRateLimitStore(),
  now = Date.now,
  max = 60,
  windowMs = 60_000,
}: { logger?: Logger; store?: RateLimitStore; now?: () => number; max?: number; windowMs?: number } = {}) {
  return async function POST(request: Request): Promise<Response> {
    const type = (request.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
    if (!(CSP_CONTENT_TYPES as readonly string[]).includes(type)) return empty(415);

    const limit = await checkRateLimit(store, `csp:${clientIp(request.headers)}`, { max, windowMs, now: now() });
    if (!limit.allowed) return empty(429, { "Retry-After": String(limit.retryAfterSeconds) });

    const body = await readBody(request, MAX_BODY_BYTES);
    if (!body.ok) return empty(body.status);

    let payload: unknown;
    try {
      payload = JSON.parse(body.text);
    } catch {
      return empty(400);
    }

    for (const violation of parseCspReports(payload)) {
      logger.warn("CSP violation", { event: "csp.violation", ...violation });
    }
    return empty(204);
  };
}
