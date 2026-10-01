import { createHmac } from "node:crypto";
import {
  AUDIENCE_LABELS,
  CHILD_AGE_LABELS,
  CONTACT_LABELS,
  DOCTOR_LABELS,
  POSITION_LABELS,
  REASON_LABELS,
  type Inquiry,
} from "@/lib/validation/inquiry";

export type DeliveryChannel = "email" | "webhook";
export type DeliveryResult =
  | { ok: true; channels: DeliveryChannel[] }
  | { ok: false; reason: "not-configured" | "failed"; detail?: string };

type Env = NodeJS.ProcessEnv;
type Fetch = typeof fetch;

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

/** Public payload — deliberately excludes honeypot/timing fields. */
export function toPayload(inquiry: Inquiry, receivedAt: Date) {
  return {
    receivedAt: receivedAt.toISOString(),
    audience: inquiry.audience,
    audienceLabel: AUDIENCE_LABELS[inquiry.audience],
    reason: inquiry.reason,
    reasonLabel: REASON_LABELS[inquiry.reason],
    name: inquiry.name,
    organization: inquiry.organization,
    email: inquiry.email,
    phone: inquiry.phone,
    preferredContact: inquiry.preferredContact,
    preferredContactLabel: CONTACT_LABELS[inquiry.preferredContact],
    language: inquiry.language,
    siteLanguage: inquiry.locale,
    childAge: inquiry.childAge ? CHILD_AGE_LABELS[inquiry.childAge] : "",
    hasPrimaryDoctor: inquiry.hasPrimaryDoctor ? DOCTOR_LABELS[inquiry.hasPrimaryDoctor] : "",
    position: inquiry.position ? POSITION_LABELS[inquiry.position] : "",
    startDate: inquiry.startDate,
    message: inquiry.message,
  };
}

export function renderEmail(payload: ReturnType<typeof toPayload>): { subject: string; html: string; text: string } {
  const rows: [string, string][] = [
    ["Who", payload.audienceLabel],
    ["Request", payload.reasonLabel],
    ["Name", payload.name],
    ["Organization", payload.organization || "—"],
    ["Phone", payload.phone || "—"],
    ["Email", payload.email || "—"],
    ["Preferred contact", payload.preferredContactLabel],
    ["Language", payload.language === "es" ? "Spanish" : "English"],
    ["Sent from", payload.siteLanguage === "es" ? "Spanish website" : "English website"],
    ...(payload.childAge ? ([["Child’s age", payload.childAge]] as [string, string][]) : []),
    ...(payload.hasPrimaryDoctor ? ([["Has a primary care doctor", payload.hasPrimaryDoctor]] as [string, string][]) : []),
    ...(payload.position ? ([["Position", payload.position]] as [string, string][]) : []),
    ...(payload.startDate ? ([["Earliest start date", payload.startDate]] as [string, string][]) : []),
    ["Notes", payload.message || "—"],
    ["Received", payload.receivedAt],
  ];
  const subject = `Website: ${payload.reasonLabel} — ${payload.name}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px">${rows
    .map(([k, v]) => `<tr><th align="left" valign="top">${escapeHtml(k)}</th><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
  return { subject, html, text };
}

async function sendEmail(payload: ReturnType<typeof toPayload>, env: Env, fetchImpl: Fetch): Promise<void> {
  const { subject, html, text } = renderEmail(payload);
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.INQUIRY_FROM_EMAIL ?? "STARS Website <onboarding@resend.dev>",
      to: (env.INQUIRY_TO_EMAIL ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: payload.email || undefined,
      subject,
      html,
      text,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
}

export function signBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

async function sendWebhook(payload: ReturnType<typeof toPayload>, env: Env, fetchImpl: Fetch): Promise<void> {
  const body = JSON.stringify({ type: "stars.inquiry", data: payload });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (env.INQUIRY_WEBHOOK_SECRET) headers["X-Stars-Signature"] = signBody(body, env.INQUIRY_WEBHOOK_SECRET);
  const res = await fetchImpl(env.INQUIRY_WEBHOOK_URL as string, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
}

/** The delivery channels this environment is configured for (no network calls). */
export function configuredChannels(env: Env = process.env): DeliveryChannel[] {
  const channels: DeliveryChannel[] = [];
  if (env.RESEND_API_KEY && env.INQUIRY_TO_EMAIL) channels.push("email");
  if (env.INQUIRY_WEBHOOK_URL) channels.push("webhook");
  return channels;
}

/**
 * Delivers an inquiry through every configured channel. Succeeds if at least
 * one channel accepted it, so a single provider outage doesn't lose a lead.
 */
export async function deliverInquiry(
  inquiry: Inquiry,
  { env = process.env, fetchImpl = fetch, now = new Date() }: { env?: Env; fetchImpl?: Fetch; now?: Date } = {},
): Promise<DeliveryResult> {
  const payload = toPayload(inquiry, now);
  const jobs: { channel: DeliveryChannel; run: () => Promise<void> }[] = [];
  for (const channel of configuredChannels(env)) {
    jobs.push({ channel, run: () => (channel === "email" ? sendEmail(payload, env, fetchImpl) : sendWebhook(payload, env, fetchImpl)) });
  }

  if (jobs.length === 0) return { ok: false, reason: "not-configured" };

  const results = await Promise.allSettled(jobs.map((j) => j.run()));
  const channels = jobs.filter((_, i) => results[i]?.status === "fulfilled").map((j) => j.channel);
  if (channels.length > 0) return { ok: true, channels };

  const detail = results
    .map((r) => (r.status === "rejected" ? String(r.reason instanceof Error ? r.reason.message : r.reason) : ""))
    .filter(Boolean)
    .join("; ");
  return { ok: false, reason: "failed", detail };
}
