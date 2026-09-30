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

export function isAllowedOrigin(request: Request, env: NodeJS.ProcessEnv = process.env): boolean {
  const origin = request.headers.get("origin");
  // Non-browser clients (curl, server-to-server) omit Origin; they are still
  // subject to validation and rate limiting.
  if (!origin) return true;
  const self = new URL(request.url).origin;
  if (origin === self) return true;
  return allowedOrigins(env).has(origin);
}
