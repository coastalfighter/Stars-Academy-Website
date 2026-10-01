import { deliverInquiry } from "@/lib/inquiry/deliver";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit, clientIp, createRateLimitStore, type RateLimitStore } from "@/lib/security/rateLimit";
import { logger as defaultLogger } from "@/lib/observability/logger";
import { sendAlert as defaultSendAlert, type AlertSender } from "@/lib/observability/alert";
import { inquirySchema, MIN_FILL_MS, toFieldErrors } from "@/lib/validation/inquiry";
import { site } from "@/content/site";
import { isLocale, type Locale } from "@/i18n/config";
import { serverMessage, type ServerMessageKey } from "@/i18n/messages";

export type InquiryResponse =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type Deps = {
  env?: NodeJS.ProcessEnv;
  store?: RateLimitStore;
  deliver?: typeof deliverInquiry;
  now?: () => number;
  logger?: { info: (message: string, fields?: unknown) => void; warn: (message: string, fields?: unknown) => void; error: (message: string, fields?: unknown) => void };
  alert?: AlertSender;
};

const MAX_BODY_BYTES = 16 * 1024;

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
  const logger = deps.logger ?? defaultLogger;
  const store = deps.store ?? createRateLimitStore(env, { logger });
  const deliver = deps.deliver ?? deliverInquiry;
  const now = deps.now ?? Date.now;
  const alert = deps.alert ?? defaultSendAlert;
  const max = Number(env.RATE_LIMIT_MAX) > 0 ? Number(env.RATE_LIMIT_MAX) : 5;
  const windowMs = Number(env.RATE_LIMIT_WINDOW_MS) > 0 ? Number(env.RATE_LIMIT_WINDOW_MS) : 10 * 60 * 1000;

  return async function POST(request: Request): Promise<Response> {
    // Until the body is parsed, respond in the language of the page that sent it.
    let locale: Locale = (request.headers.get("accept-language") ?? "").toLowerCase().startsWith("es") ? "es" : "en";
    const t = (key: ServerMessageKey) => serverMessage(key, locale, site.phone.display);

    if (!isAllowedOrigin(request, env)) {
      return json({ ok: false, error: t("badOrigin") }, 403);
    }

    if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
      return json({ ok: false, error: t("unsupportedType") }, 415);
    }

    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > MAX_BODY_BYTES) return json({ ok: false, error: t("tooLarge") }, 413);

    const limit = await checkRateLimit(store, `inquiry:${clientIp(request.headers)}`, { max, windowMs, now: now() });
    if (!limit.allowed) {
      return json(
        { ok: false, error: t("rateLimited") },
        429,
        { "Retry-After": String(limit.retryAfterSeconds) },
      );
    }

    let raw: unknown;
    try {
      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) return json({ ok: false, error: t("tooLarge") }, 413);
      raw = JSON.parse(text);
    } catch {
      return json({ ok: false, error: t("unreadable") }, 400);
    }
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return json({ ok: false, error: t("unreadable") }, 400);
    }

    const record = raw as Record<string, unknown>;
    if (isLocale(record.locale)) locale = record.locale;
    const honeypot = typeof record.website === "string" && record.website.length > 0;
    const startedAt = Number(record.startedAt);
    const tooFast = Number.isFinite(startedAt) && startedAt > 0 && now() - startedAt < MIN_FILL_MS;
    if (honeypot || tooFast) {
      // Pretend success so automated submitters get no signal to adapt to.
      logger.warn("[inquiry] dropped likely bot submission", { event: "inquiry.bot", honeypot, tooFast });
      return json({ ok: true, message: t("received") }, 200);
    }

    const parsed = inquirySchema.safeParse(record);
    if (!parsed.success) {
      return json({ ok: false, error: t("checkFields"), fieldErrors: toFieldErrors(parsed.error, locale) }, 422);
    }

    const result = await deliver(parsed.data, { env });
    if (result.ok) {
      logger.info("[inquiry] delivered", { event: "inquiry.delivered", channels: result.channels, reason: parsed.data.reason });
      return json({ ok: true, message: t("thanks") }, 200);
    }

    if (result.reason === "not-configured") {
      if (env.NODE_ENV !== "production") {
        // Development convenience: log a PHI-free summary instead of sending.
        logger.info("[inquiry] (dev) delivery not configured; accepted", {
          event: "inquiry.dev-accepted",
          reason: parsed.data.reason,
          audience: parsed.data.audience,
        });
        return json({ ok: true, message: t("thanks") }, 200);
      }
      logger.error("[inquiry] no delivery channel configured", { event: "inquiry.unconfigured" });
      await alert({
        fingerprint: "inquiry:not-configured",
        severity: "critical",
        title: "Website inquiries are being refused: no delivery channel is configured",
        details: { action: "Set RESEND_API_KEY + INQUIRY_TO_EMAIL or INQUIRY_WEBHOOK_URL, then redeploy." },
      });
      return json({ ok: false, error: t("unavailable") }, 503);
    }

    logger.error("[inquiry] delivery failed", { event: "inquiry.failed", detail: result.detail });
    await alert({
      fingerprint: "inquiry:delivery-failed",
      severity: "critical",
      title: "A website inquiry could not be delivered (the visitor was asked to call)",
      details: { reason: parsed.data.reason, providerError: result.detail },
    });
    return json({ ok: false, error: t("failed") }, 502);
  };
}
