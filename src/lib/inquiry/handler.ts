import { deliverInquiry } from "@/lib/inquiry/deliver";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit, clientIp, MemoryRateLimitStore, type RateLimitStore } from "@/lib/security/rateLimit";
import { inquirySchema, MIN_FILL_MS, toFieldErrors } from "@/lib/validation/inquiry";
import { site } from "@/content/site";

export type InquiryResponse =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type Deps = {
  env?: NodeJS.ProcessEnv;
  store?: RateLimitStore;
  deliver?: typeof deliverInquiry;
  now?: () => number;
  logger?: Pick<Console, "info" | "warn" | "error">;
};

const MAX_BODY_BYTES = 16 * 1024;
const PHONE_FALLBACK = `Please call us at ${site.phone.display} (${site.hours.short}).`;

const json = (body: InquiryResponse, status: number, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/**
 * Builds the POST /api/inquiry handler. Dependencies are injectable so the
 * full request pipeline can be unit-tested without network or globals.
 *
 * Pipeline: origin check → content-type/size → rate limit → parse →
 * honeypot/timing (silent accept) → schema validation (incl. PHI guard) →
 * delivery.
 */
export function createInquiryHandler(deps: Deps = {}) {
  const env = deps.env ?? process.env;
  const store = deps.store ?? new MemoryRateLimitStore();
  const deliver = deps.deliver ?? deliverInquiry;
  const now = deps.now ?? Date.now;
  const logger = deps.logger ?? console;
  const max = Number(env.RATE_LIMIT_MAX) > 0 ? Number(env.RATE_LIMIT_MAX) : 5;
  const windowMs = Number(env.RATE_LIMIT_WINDOW_MS) > 0 ? Number(env.RATE_LIMIT_WINDOW_MS) : 10 * 60 * 1000;

  return async function POST(request: Request): Promise<Response> {
    if (!isAllowedOrigin(request, env)) {
      return json({ ok: false, error: "This request isn’t allowed from that origin." }, 403);
    }

    if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
      return json({ ok: false, error: "Unsupported content type." }, 415);
    }

    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > MAX_BODY_BYTES) return json({ ok: false, error: "Request is too large." }, 413);

    const limit = await checkRateLimit(store, `inquiry:${clientIp(request.headers)}`, { max, windowMs, now: now() });
    if (!limit.allowed) {
      return json(
        { ok: false, error: `Too many requests. ${PHONE_FALLBACK}` },
        429,
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }

    let raw: unknown;
    try {
      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) return json({ ok: false, error: "Request is too large." }, 413);
      raw = JSON.parse(text);
    } catch {
      return json({ ok: false, error: "We couldn’t read that request." }, 400);
    }
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return json({ ok: false, error: "We couldn’t read that request." }, 400);
    }

    const record = raw as Record<string, unknown>;
    const honeypot = typeof record.website === "string" && record.website.length > 0;
    const startedAt = Number(record.startedAt);
    const tooFast = Number.isFinite(startedAt) && startedAt > 0 && now() - startedAt < MIN_FILL_MS;
    if (honeypot || tooFast) {
      // Pretend success so automated submitters get no signal to adapt to.
      logger.warn("[inquiry] dropped likely bot submission", { honeypot, tooFast });
      return json({ ok: true, message: "Thank you — our team will be in touch." }, 200);
    }

    const parsed = inquirySchema.safeParse(record);
    if (!parsed.success) {
      return json({ ok: false, error: "Please check the highlighted fields.", fieldErrors: toFieldErrors(parsed.error) }, 422);
    }

    const result = await deliver(parsed.data, { env });
    if (result.ok) {
      logger.info("[inquiry] delivered", { channels: result.channels, reason: parsed.data.reason });
      return json({ ok: true, message: "Thank you — our team will contact you within one business day." }, 200);
    }

    if (result.reason === "not-configured") {
      if (env.NODE_ENV !== "production") {
        // Development convenience: log a PHI-free summary instead of sending.
        logger.info("[inquiry] (dev) delivery not configured; accepted", {
          reason: parsed.data.reason,
          audience: parsed.data.audience,
        });
        return json({ ok: true, message: "Thank you — our team will contact you within one business day." }, 200);
      }
      logger.error("[inquiry] no delivery channel configured");
      return json({ ok: false, error: `Our online form is temporarily unavailable. ${PHONE_FALLBACK}` }, 503);
    }

    logger.error("[inquiry] delivery failed", { detail: result.detail });
    return json({ ok: false, error: `We couldn’t send your message just now. ${PHONE_FALLBACK}` }, 502);
  };
}
