/**
 * Same-origin guard for state-changing API routes (CSRF / CORS hardening).
 * Browsers always send `Origin` on cross-site POSTs, so a POST whose origin
 * isn't this site or an explicitly allowed origin is rejected.
 */
export function allowedOrigins(env: NodeJS.ProcessEnv = process.env): Set<string> {
  const list = new Set<string>();
  const add = (value: string | undefined) => {
    if (!value) return;
    try {
      list.add(new URL(value.trim()).origin);
    } catch {
      // Ignore malformed entries rather than failing every request.
    }
  };
  add(env.NEXT_PUBLIC_SITE_URL);
  (env.ALLOWED_ORIGINS ?? "").split(",").forEach(add);
  return list;
}

/**
 * The host the visitor actually requested. Behind proxies (and in Next.js,
 * where `request.url` reflects the server's bind address) the Host /
 * X-Forwarded-Host headers are authoritative. A cross-site attacker can't
 * forge these: the browser sets Host to the target and Origin to the attacker.
 */
function requestHost(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("host")?.trim() || null;
}

export function isAllowedOrigin(request: Request, env: NodeJS.ProcessEnv = process.env): boolean {
  const origin = request.headers.get("origin");
  // Non-browser clients (curl, server-to-server) omit Origin; they are still
  // subject to validation and rate limiting.
  if (!origin) return true;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false; // includes the literal "null" origin from sandboxed frames
  }

  if (originHost === new URL(request.url).host) return true;
  const host = requestHost(request);
  if (host && originHost === host) return true;
  return allowedOrigins(env).has(origin);
}
