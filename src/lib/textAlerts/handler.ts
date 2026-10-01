import { createHash, createHmac } from "node:crypto";
import { z } from "zod";
import { cmsQuery } from "@/cms/client";
import { cmsConfig, type CmsConfig } from "@/cms/config";
import { SIGNATURE_HEADER, verifySignature } from "@/cms/webhook";
import { logger as defaultLogger, type Logger } from "@/lib/observability/logger";
import { sendAlert as defaultSendAlert, type AlertSender } from "@/lib/observability/alert";
import { checkRateLimit, createRateLimitStore, type RateLimitStore } from "@/lib/security/rateLimit";
import { composeTextAlert, countSegments, MAX_SEGMENTS } from "./message";
import { onceStore, type OnceStore } from "./once";

/**
 * POST /api/alerts/text: called by a Sanity webhook when an announcement
 * marked "also send as a text" is published.
 *
 * The webhook body is only a pointer: the announcement is re-read, uncached,
 * from Sanity's published dataset, and every guard below must pass before a
 * single text goes out:
 *   1. the webhook signature is valid and fresh;
 *   2. it is a published closure or urgent notice, with "send as text" on,
 *      showing now or within 12 hours, and not over;
 *   3. the text fits in four SMS parts;
 *   4. this exact text hasn't been sent for this announcement (re-publishing
 *      an unchanged notice never re-texts families; changing the text does);
 *   5. no more than four alerts in six hours (stops accidental floods);
 *   6. TEXT_ALERTS_MODE is "live" ("dry-run" posts a preview to the staff chat
 *      instead; anything else, including unset, sends nothing).
 *
 * Families' phone numbers live only at the text-message provider. This
 * endpoint sends the provider a signed request with the message; the
 * provider (directly, or via Zapier/Make) texts its subscriber list.
 */

export type TextAlertMode = "off" | "dry-run" | "live";
export const textAlertMode = (env: NodeJS.ProcessEnv): TextAlertMode =>
  env.TEXT_ALERTS_MODE === "live" ? "live" : env.TEXT_ALERTS_MODE === "dry-run" ? "dry-run" : "off";

export const ANNOUNCEMENT_FOR_TEXT_QUERY = /* groq */ `
*[_type == "announcement" && _id == $id][0]{
  "id": _id,
  kind,
  startsAt,
  endsAt,
  "sendText": coalesce(sendText, false),
  "text": { "en": textMessage.en, "es": textMessage.es }
}`;

const announcementSchema = z
  .object({
    id: z.string().min(1).max(120),
    kind: z.enum(["info", "event", "closure", "urgent"]),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }).nullish().transform((v) => v ?? null),
    // Announcements written before text alerts existed have neither field: treat as "not requested".
    sendText: z.boolean().nullish().transform((v) => v ?? false),
    text: z
      .object({ en: z.string().trim().max(400).nullish(), es: z.string().trim().max(400).nullish() })
      .nullish()
      .transform((v) => v ?? { en: null, es: null }),
  })
  .nullable();

const LEAD_MS = 12 * 3600_000;
const SEND_TTL_SECONDS = 30 * 86_400;

type Deps = {
  env?: NodeJS.ProcessEnv;
  config?: CmsConfig | null;
  fetchImpl?: typeof fetch;
  logger?: Logger;
  alert?: AlertSender;
  once?: OnceStore;
  cap?: RateLimitStore;
  now?: () => number;
  /** Loads the published announcement; injectable for tests. */
  load?: (id: string) => Promise<z.output<typeof announcementSchema> | "error">;
};

const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export function createTextAlertHandler(deps: Deps = {}) {
  const env = deps.env ?? process.env;
  const logger = deps.logger ?? defaultLogger;
  const alert = deps.alert ?? defaultSendAlert;
  // Shared across server instances when Upstash is configured, so the cap really is global.
  const cap = deps.cap ?? createRateLimitStore(env, { logger });
  const now = deps.now ?? Date.now;
  const fetchImpl = deps.fetchImpl ?? fetch;

  const load =
    deps.load ??
    (async (id: string) => {
      const result = await cmsQuery(ANNOUNCEMENT_FOR_TEXT_QUERY, { id }, announcementSchema, { tags: [], revalidate: 0, fresh: true }, { config: deps.config, isDraft: async () => false });
      return result === null ? "error" : result;
    });

  return async function POST(request: Request): Promise<Response> {
    const config = deps.config === undefined ? cmsConfig(env) : deps.config;
    const secret = env.TEXT_ALERTS_WEBHOOK_SECRET || config?.webhookSecret;
    if (!secret) return json({ ok: false, error: "Text alerts are not configured." }, 503);

    const body = await request.text();
    if (body.length > 8 * 1024) return json({ ok: false, error: "Payload too large." }, 413);
    const check = verifySignature(request.headers.get(SIGNATURE_HEADER), body, secret, now());
    if (!check.ok) return json({ ok: false, error: `Invalid signature (${check.reason}).` }, 401);

    let id: unknown;
    try {
      id = (JSON.parse(body) as { _id?: unknown })._id;
    } catch {
      return json({ ok: false, error: "Invalid JSON." }, 400);
    }
    if (typeof id !== "string" || !/^[\w-]{1,120}$/.test(id)) {
      // Drafts ("drafts.…") and malformed IDs are ignored: only published notices are texted.
      return json({ ok: true, sent: false, reason: "not-a-published-document" });
    }

    const mode = textAlertMode(env);
    if (mode === "off") return json({ ok: true, sent: false, reason: "disabled" });

    const doc = await load(id);
    if (doc === "error") return json({ ok: false, error: "Couldn’t read the announcement; try again." }, 502);
    const t = now();
    const skip = (reason: string) => {
      logger.info("text alert skipped", { event: "textalert.skipped", id, reason });
      return json({ ok: true, sent: false, reason });
    };
    if (!doc) return skip("not-found");
    if (!doc.sendText) return skip("not-requested");
    if (doc.kind !== "closure" && doc.kind !== "urgent") return skip("kind-not-allowed");
    if (doc.endsAt && Date.parse(doc.endsAt) <= t) return skip("already-over");
    if (Date.parse(doc.startsAt) - t > LEAD_MS) return skip("too-early");
    if (!doc.text.en) return skip("no-text");

    const message = composeTextAlert({ en: doc.text.en, es: doc.text.es ?? null });
    const segments = countSegments(message);
    if (segments.segments > MAX_SEGMENTS) {
      await alert({ fingerprint: `textalert:too-long:${id}`, severity: "warning", title: "A text alert was too long to send", details: { id, segments: segments.segments } });
      return skip("too-long");
    }

    const store = deps.once ?? onceStore(env);
    const key = `textalert:${id}:${createHash("sha256").update(message).digest("hex").slice(0, 16)}`;
    if (!(await store.claim(key, SEND_TTL_SECONDS))) return skip("already-sent");

    const budget = await checkRateLimit(cap, "textalerts", { max: 4, windowMs: 6 * 3600_000, now: t });
    if (!budget.allowed) {
      await store.release(key);
      await alert({
        fingerprint: "textalert:cap",
        severity: "critical",
        title: "Text alert NOT sent: more than 4 alerts in 6 hours",
        details: { id, action: "If this is a real emergency, send it from the text-message provider directly." },
      });
      return skip("rate-capped");
    }

    if (mode === "dry-run") {
      await alert({
        fingerprint: `textalert:dry:${key}`,
        severity: "warning",
        title: "Text alert preview (dry run, nothing was sent)",
        details: { id, preview: message, segments: segments.segments, encoding: segments.encoding },
      });
      logger.info("text alert dry run", { event: "textalert.dry-run", id, segments: segments.segments });
      return json({ ok: true, sent: false, reason: "dry-run", segments: segments.segments });
    }

    const providerUrl = env.TEXT_ALERTS_PROVIDER_URL;
    if (!providerUrl || !providerUrl.startsWith("https://")) {
      await store.release(key);
      await alert({ fingerprint: "textalert:no-provider", severity: "critical", title: "Text alert NOT sent: TEXT_ALERTS_PROVIDER_URL is not set", details: { id } });
      return json({ ok: false, error: "Provider not configured." }, 503);
    }

    const payload = JSON.stringify({ type: "stars.text_alert", id, kind: doc.kind, message, segments: segments.segments, encoding: segments.encoding, sentAt: new Date(t).toISOString() });
    const headers: Record<string, string> = { "Content-Type": "application/json", "Idempotency-Key": key };
    if (env.TEXT_ALERTS_PROVIDER_SECRET) headers["X-Stars-Signature"] = createHmac("sha256", env.TEXT_ALERTS_PROVIDER_SECRET).update(payload).digest("hex");
    try {
      const res = await fetchImpl(providerUrl, { method: "POST", headers, body: payload, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`provider responded ${res.status}`);
    } catch (error) {
      await store.release(key);
      logger.error("text alert failed", { event: "textalert.failed", id, error });
      await alert({ fingerprint: `textalert:failed:${id}`, severity: "critical", title: "Text alert FAILED to send. Families were not texted.", details: { id, providerError: error instanceof Error ? error.message : String(error) } });
      return json({ ok: false, error: "Provider error." }, 502);
    }

    logger.info("text alert sent", { event: "textalert.sent", id, segments: segments.segments });
    await alert({ fingerprint: `textalert:sent:${key}`, severity: "warning", title: "Text alert sent to families", details: { id, preview: message } });
    return json({ ok: true, sent: true, segments: segments.segments });
  };
}
