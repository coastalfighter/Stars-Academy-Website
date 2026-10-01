import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { cmsConfig, type CmsConfig } from "./config";
import { queryUrl } from "./client";

/**
 * Editor preview ("draft mode") uses short-lived secrets created by the
 * Studio's Preview action as `previewSecret` documents (only signed-in editors
 * can create them). The site checks the secret against the dataset with its
 * server-side read token — no long-lived secret ever ships to a browser.
 */

export const PREVIEW_SECRET_QUERY = /* groq */ `*[_type == "previewSecret" && secret == $secret && expiresAt > now()][0]{ secret }`;

/** Only same-site paths may be redirected to (prevents open redirects). */
export function safeRedirect(value: string | null, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://stars.invalid");
    return url.origin === "https://stars.invalid" ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export async function isValidPreviewSecret(
  secret: string | null,
  { config = cmsConfig(), fetchImpl = fetch }: { config?: CmsConfig | null; fetchImpl?: typeof fetch } = {},
): Promise<boolean> {
  if (!config?.readToken || !secret || !/^[A-Za-z0-9_-]{32,128}$/.test(secret)) return false;
  try {
    const res = await fetchImpl(queryUrl(config, PREVIEW_SECRET_QUERY, { secret }, true), {
      headers: { Authorization: `Bearer ${config.readToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const body = z.object({ result: z.object({ secret: z.string() }).nullable() }).safeParse(await res.json());
    if (!body.success || !body.data.result) return false;
    const a = Buffer.from(body.data.result.secret);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
