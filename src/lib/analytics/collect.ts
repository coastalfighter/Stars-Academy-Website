import { logger as defaultLogger, type Logger } from "@/lib/observability/logger";
import { readBody } from "@/lib/security/body";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit, clientIp, MemoryRateLimitStore, type RateLimitStore } from "@/lib/security/rateLimit";
import { dayKey, incrementsFor, isBot, optedOutByHeader } from "./normalize";
import { analyticsEnabled, analyticsStore, type AnalyticsStore } from "./store";

const MAX_BODY_BYTES = 2 * 1024;

const empty = (status: number, headers: Record<string, string> = {}) =>
  new Response(null, { status, headers: { "Cache-Control": "no-store", ...headers } });

/**
 * POST /api/collect: receives analytics beacons and increments daily counters.
 *
 * The IP address is used only for in-memory flood protection and is never
 * stored or logged. Beacons are accepted as text/plain (what `sendBeacon`
 * sends without a CORS preflight) or JSON, from this site's pages only.
 * Bots, GPC/DNT requests and malformed beacons get a silent 204: there is
 * nothing for a client to learn or retry.
 */
export function createCollectHandler({
  env = process.env,
  store,
  logger = defaultLogger,
  rateStore = new MemoryRateLimitStore(),
  now = Date.now,
  max = 120,
  windowMs = 60_000,
}: {
  env?: NodeJS.ProcessEnv;
  store?: AnalyticsStore;
  logger?: Logger;
  rateStore?: RateLimitStore;
  now?: () => number;
  max?: number;
  windowMs?: number;
} = {}) {
  return async function POST(request: Request): Promise<Response> {
    if (!analyticsEnabled(env)) return empty(204);
    if (!isAllowedOrigin(request, env)) return empty(403);
    const type = (request.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
    if (type !== "text/plain" && type !== "application/json") return empty(415);

    const limit = await checkRateLimit(rateStore, `collect:${clientIp(request.headers)}`, { max, windowMs, now: now() });
    if (!limit.allowed) return empty(429, { "Retry-After": String(limit.retryAfterSeconds) });

    const body = await readBody(request, MAX_BODY_BYTES);
    if (!body.ok) return empty(body.status);
    if (isBot(request.headers.get("user-agent")) || optedOutByHeader(request.headers)) return empty(204);

    let raw: unknown;
    try {
      raw = JSON.parse(body.text);
    } catch {
      return empty(204);
    }
    const increments = incrementsFor(raw);
    if (!increments) return empty(204);

    try {
      await (store ?? analyticsStore()).record(dayKey(now()), increments);
    } catch (error) {
      // Analytics must never affect visitors; note it for operators and move on.
      logger.warn("analytics write failed", { event: "analytics.write-failed", error });
    }
    return empty(204);
  };
}
