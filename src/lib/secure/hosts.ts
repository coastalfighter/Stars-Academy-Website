/**
 * Hosts allowed to receive protected health information from this site's
 * visitors (enrollment forms, referral uploads).
 *
 * Links to these services can be edited in the CMS, but a link only works
 * if its host is on this list, which lives in the deployment settings
 * (SECURE_FORM_HOSTS), not in the CMS. A stolen CMS login therefore can't
 * point families at a look-alike form. Adobe Acrobat Sign, which STARS
 * uses today, is allowed by default.
 *
 * SECURE_FORM_HOSTS is comma-separated: "forms.example-hipaa.com" allows
 * that exact host; ".example-hipaa.com" allows it and every subdomain.
 */
export const DEFAULT_SECURE_HOSTS = [".documents.adobe.com"] as const;

export function secureHosts(env: NodeJS.ProcessEnv = process.env): string[] {
  const extra = (env.SECURE_FORM_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter((h) => /^\.?[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(h));
  return [...new Set([...DEFAULT_SECURE_HOSTS, ...extra])];
}

/** True for an https URL (no credentials, default port) on an allowed host. */
export function isApprovedSecureUrl(raw: string, hosts: readonly string[]): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
  const host = url.hostname.toLowerCase();
  return hosts.some((h) => (h.startsWith(".") ? host === h.slice(1) || host.endsWith(h) : host === h));
}

/**
 * Direct secure messaging addresses (used by physicians' EHRs). Direct
 * addresses look like email addresses on a dedicated "direct" domain.
 */
export const DIRECT_ADDRESS = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]*direct[A-Za-z0-9.-]*\.[A-Za-z]{2,}$/;
