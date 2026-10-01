/** Shared E2E settings (ports, secrets) — test-only values. */
export const PORTS = { site: 3200, cms: 3201, receiver: 4599 } as const;
export const RECEIVER_URL = `http://127.0.0.1:${PORTS.receiver}`;
export const WEBHOOK_SECRET = "e2e-inquiry-secret";
export const SANITY_WEBHOOK_SECRET = "e2e-sanity-secret";
export const CMS_PROJECT_ID = "e2etest01";
export const INSIGHTS_PASSWORD = "e2e-insights-password";
export const INSIGHTS_SESSION_SECRET = "e2e-insights-session-secret-0123456789";
