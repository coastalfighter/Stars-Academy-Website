/**
 * Whether search engines may index this deployment.
 *
 * Only production is indexable. Vercel preview and development deployments
 * say "noindex" (robots.txt, an X-Robots-Tag header and a robots meta tag),
 * so a preview URL never competes with www.mystarsacademy.org in search.
 * Outside Vercel (self-hosting, local production builds, CI), VERCEL_ENV is
 * unset and the site behaves as production.
 */
export function isIndexable(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL_ENV === undefined || env.VERCEL_ENV === "production";
}

/** Search-console ownership tags, when set. DNS verification is preferred (docs/LAUNCH.md). */
export function verificationTags(env: NodeJS.ProcessEnv = process.env): { google?: string; other?: Record<string, string> } | undefined {
  const google = env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;
  return { ...(google ? { google } : {}), ...(bing ? { other: { "msvalidate.01": bing } } : {}) };
}
