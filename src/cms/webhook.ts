import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies Sanity's webhook signature header:
 *   sanity-webhook-signature: t=<unix ms>,v1=<base64url HMAC-SHA256 of "<t>.<raw body>">
 * Rejects stale timestamps to prevent replaying a captured request.
 */
export const SIGNATURE_HEADER = "sanity-webhook-signature";
export const MAX_SKEW_MS = 5 * 60 * 1000;

const base64url = (buf: Buffer) => buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export function signPayload(body: string, secret: string, timestamp: number): string {
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest();
  return `t=${timestamp},v1=${base64url(digest)}`;
}

export function verifySignature(
  header: string | null,
  body: string,
  secret: string,
  now: number = Date.now(),
): { ok: true } | { ok: false; reason: "missing" | "malformed" | "stale" | "mismatch" } {
  if (!header) return { ok: false, reason: "missing" };
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  );
  const t = Number(parts.t);
  const given = parts.v1;
  if (!Number.isFinite(t) || !given) return { ok: false, reason: "malformed" };
  if (Math.abs(now - t) > MAX_SKEW_MS) return { ok: false, reason: "stale" };

  const expected = signPayload(body, secret, t).split("v1=")[1] ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "mismatch" };
  return { ok: true };
}
