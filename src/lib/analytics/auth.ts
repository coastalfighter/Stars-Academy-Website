import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Staff access to the insights dashboard.
 *
 * One shared password (INSIGHTS_PASSWORD, at least 12 characters) and a
 * session secret (INSIGHTS_SESSION_SECRET, at least 32 characters). A
 * successful login sets an httpOnly, SameSite=Strict cookie holding an expiry
 * and an HMAC over it; nothing is stored server-side. The HMAC also covers a
 * fingerprint of the password, so changing the password signs everyone out.
 *
 * This cookie exists only for staff who log in. Visitors never receive one.
 */

export const SESSION_COOKIE = "stars_insights";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;
export const MIN_PASSWORD_LENGTH = 12;
export const MIN_SECRET_LENGTH = 32;

export type InsightsConfig = { password: string; secret: string };

export function insightsConfig(env: NodeJS.ProcessEnv = process.env): InsightsConfig | null {
  const password = env.INSIGHTS_PASSWORD ?? "";
  const secret = env.INSIGHTS_SESSION_SECRET ?? "";
  if (password.length < MIN_PASSWORD_LENGTH || secret.length < MIN_SECRET_LENGTH) return null;
  return { password, secret };
}

const sha256 = (s: string) => createHash("sha256").update(s, "utf8").digest();

function signature(config: InsightsConfig, expires: number): Buffer {
  const passwordTag = sha256(config.password).toString("hex").slice(0, 16);
  return createHmac("sha256", config.secret).update(`v1|${expires}|${passwordTag}`).digest();
}

/** Constant-time comparison (digests have equal length whatever the input). */
export function passwordMatches(config: InsightsConfig, attempt: string): boolean {
  return timingSafeEqual(sha256(attempt), sha256(config.password));
}

export function createSession(config: InsightsConfig, now = Date.now()): string {
  const expires = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  return `${expires}.${signature(config, expires).toString("base64url")}`;
}

export function verifySession(config: InsightsConfig | null, token: string | undefined, now = Date.now()): boolean {
  if (!config || !token) return false;
  const match = /^(\d{1,12})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return false;
  const expires = Number(match[1]);
  if (!Number.isSafeInteger(expires) || expires * 1000 <= now) return false;
  const given = Buffer.from(match[2]!, "base64url");
  const expected = signature(config, expires);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Secure cookies need HTTPS; local development and tests run over HTTP. */
export function isHttps(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return (forwarded ?? new URL(request.url).protocol.replace(":", "")) === "https";
}

export function sessionCookie(value: string, { secure, maxAge = SESSION_TTL_SECONDS }: { secure: boolean; maxAge?: number }): string {
  return [`${SESSION_COOKIE}=${value}`, "Path=/", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAge}`, ...(secure ? ["Secure"] : [])].join("; ");
}

export const clearedSessionCookie = (secure: boolean) => sessionCookie("", { secure, maxAge: 0 });

/** Reads the session cookie from a request's Cookie header. */
export function sessionFromRequest(request: Request): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return rest.join("=");
  }
  return undefined;
}
