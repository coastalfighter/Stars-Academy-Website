import { cmsConfig } from "@/cms/config";
import { configuredChannels } from "@/lib/inquiry/deliver";
import { rateLimitBackend } from "@/lib/security/rateLimit";

export type HealthReport = {
  status: "ok" | "degraded";
  time: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  checks: {
    inquiryDelivery: "configured" | "missing";
    rateLimit: "shared" | "memory";
    content: "cms" | "bundled";
    alerts: "on" | "off";
  };
};

const startedAt = Date.now();

/**
 * Readiness from configuration alone: cheap, makes no outbound calls (so an
 * uptime monitor polling every minute costs nothing and can't be used to
 * hammer a provider), and reveals no secrets, only which features are on.
 *
 * "degraded" means visitors are affected: in production, inquiries can't be
 * delivered, so the form would refuse them.
 */
export function healthReport(env: NodeJS.ProcessEnv = process.env, now = Date.now()): HealthReport {
  const delivery = configuredChannels(env).length > 0 ? "configured" : "missing";
  const production = (env.VERCEL_ENV ?? env.NODE_ENV) === "production";
  return {
    status: production && delivery === "missing" ? "degraded" : "ok",
    time: new Date(now).toISOString(),
    version: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    environment: env.VERCEL_ENV ?? env.NODE_ENV ?? "unknown",
    uptimeSeconds: Math.round((now - startedAt) / 1000),
    checks: {
      inquiryDelivery: delivery,
      rateLimit: rateLimitBackend(env),
      content: cmsConfig(env) ? "cms" : "bundled",
      alerts: env.ALERT_WEBHOOK_URL ? "on" : "off",
    },
  };
}
