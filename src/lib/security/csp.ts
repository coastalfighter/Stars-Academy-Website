/**
 * Content-Security-Policy, in one place so next.config.ts and the tests agree.
 *
 * - Fonts are self-hosted by next/font, so no third-party font hosts are needed.
 * - The 3D scene creates blob: workers/textures, so blob: is allowed for those.
 * - Next.js injects inline bootstrapping scripts; 'unsafe-inline' is required
 *   unless the app moves to nonce-based CSP via a proxy (which forces dynamic
 *   rendering and loses static generation for this marketing site).
 * - Violations are reported to /api/csp-report, through both the Reporting API
 *   (`report-to`, current browsers) and `report-uri` (Firefox, older Safari).
 */

export const CSP_REPORT_PATH = "/api/csp-report";
export const CSP_REPORT_GROUP = "csp";

export function buildCsp({ dev = false }: { dev?: boolean } = {}): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
    `report-uri ${CSP_REPORT_PATH}`,
    `report-to ${CSP_REPORT_GROUP}`,
  ].join("; ");
}

/** `Reporting-Endpoints` header value that names the `report-to` group. */
export const REPORTING_ENDPOINTS = `${CSP_REPORT_GROUP}="${CSP_REPORT_PATH}"`;
