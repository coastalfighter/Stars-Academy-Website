import { createHmac } from "node:crypto";
import { logger as defaultLogger, type Logger } from "./logger";
import { redact, redactText } from "./redact";

/**
 * Operational alerts: a POST to ALERT_WEBHOOK_URL when something needs a
 * person's attention (server errors, inquiry delivery failures).
 *
 * The body carries a top-level `text`, so Slack / Mattermost / Discord-style
 * incoming webhooks and Teams / Power Automate workflows display it as-is;
 * `event` holds the structured, redacted details for anything smarter.
 * With ALERT_WEBHOOK_SECRET set, the body is signed (HMAC-SHA256, hex) in
 * `X-Stars-Signature`, the same scheme as inquiry webhooks.
 *
 * Alerts are throttled per fingerprint and capped per hour so an outage
 * produces one message, not thousands. Sending never throws.
 */

export type AlertSeverity = "warning" | "critical";

export type Alert = {
  /** Stable identity used for de-duplication, e.g. "server-error:/api/inquiry:abc123". */
  fingerprint: string;
  severity: AlertSeverity;
  title: string;
  details?: Record<string, unknown>;
};

type Fetch = typeof fetch;

export type AlertSender = (alert: Alert) => Promise<"sent" | "throttled" | "disabled" | "failed">;

export function createAlertSender({
  env = process.env,
  fetchImpl = fetch,
  now = Date.now,
  logger = defaultLogger,
  dedupeMs = 15 * 60 * 1000,
  maxPerHour = 20,
}: {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: Fetch;
  now?: () => number;
  logger?: Logger;
  dedupeMs?: number;
  maxPerHour?: number;
} = {}): AlertSender {
  const lastSent = new Map<string, number>();
  let hourStart = 0;
  let sentThisHour = 0;

  return async function sendAlert(alert) {
    const url = env.ALERT_WEBHOOK_URL;
    if (!url) return "disabled";

    const t = now();
    const previous = lastSent.get(alert.fingerprint);
    if (previous !== undefined && t - previous < dedupeMs) return "throttled";
    if (t - hourStart >= 60 * 60 * 1000) {
      hourStart = t;
      sentThisHour = 0;
    }
    if (sentThisHour >= maxPerHour) return "throttled";

    lastSent.set(alert.fingerprint, t);
    sentThisHour += 1;
    // Keep the de-duplication map bounded.
    if (lastSent.size > 500) {
      for (const [key, at] of lastSent) if (t - at >= dedupeMs) lastSent.delete(key);
    }

    const where = env.VERCEL_ENV ?? env.NODE_ENV ?? "unknown";
    const icon = alert.severity === "critical" ? "🔴" : "🟡";
    const event = {
      fingerprint: redactText(alert.fingerprint),
      severity: alert.severity,
      title: redactText(alert.title),
      environment: where,
      version: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
      site: env.NEXT_PUBLIC_SITE_URL,
      at: new Date(t).toISOString(),
      details: redact(alert.details ?? {}),
    };
    const body = JSON.stringify({ text: `${icon} [STARS website · ${where}] ${event.title}`, event });

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (env.ALERT_WEBHOOK_SECRET) {
      headers["X-Stars-Signature"] = createHmac("sha256", env.ALERT_WEBHOOK_SECRET).update(body).digest("hex");
    }

    try {
      const res = await fetchImpl(url, { method: "POST", headers, body, signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error(`alert webhook responded ${res.status}`);
      return "sent";
    } catch (error) {
      // Allow a retry on the next occurrence instead of silencing the fingerprint.
      lastSent.delete(alert.fingerprint);
      logger.warn("alert delivery failed", { event: "alert.failed", fingerprint: alert.fingerprint, error });
      return "failed";
    }
  };
}

/** Process-wide sender (throttling state is per server instance). */
export const sendAlert = createAlertSender();
