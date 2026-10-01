import { healthReport } from "@/lib/observability/health";

const env = (e: Record<string, string>) => e as unknown as NodeJS.ProcessEnv;

describe("healthReport", () => {
  it("is ok with delivery configured, and reports what is on", () => {
    const r = healthReport(
      env({
        VERCEL_ENV: "production",
        INQUIRY_WEBHOOK_URL: "https://hooks.test",
        UPSTASH_REDIS_REST_URL: "https://x.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "secret-token",
        VERCEL_GIT_COMMIT_SHA: "abcdef123",
      }),
    );
    expect(r).toMatchObject({
      status: "ok",
      version: "abcdef1",
      environment: "production",
      checks: { inquiryDelivery: "configured", rateLimit: "shared", content: "bundled", alerts: "off" },
    });
    expect(JSON.stringify(r)).not.toContain("secret-token");
  });

  it("is degraded in production when inquiries can't be delivered", () => {
    expect(healthReport(env({ NODE_ENV: "production" })).status).toBe("degraded");
    expect(healthReport(env({ NODE_ENV: "development" })).status).toBe("ok");
  });
});
