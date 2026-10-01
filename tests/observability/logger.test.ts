import { createLogger, type LogLevel } from "@/lib/observability/logger";

function capture(env: Record<string, string> = {}) {
  const lines: { level: LogLevel; data: Record<string, unknown> }[] = [];
  const logger = createLogger({
    env: env as unknown as NodeJS.ProcessEnv,
    sink: (level, line) => lines.push({ level, data: JSON.parse(line) as Record<string, unknown> }),
    now: () => new Date("2026-10-01T12:00:00Z"),
  });
  return { logger, lines };
}

describe("logger", () => {
  it("writes one redacted JSON object per line", () => {
    const { logger, lines } = capture({ NODE_ENV: "production", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: "abcdef1234" });
    logger.error("delivery failed for a@b.co", { event: "inquiry.failed", phone: "870-555-0134", detail: "timeout" });
    expect(lines).toEqual([
      {
        level: "error",
        data: {
          time: "2026-10-01T12:00:00.000Z",
          level: "error",
          service: "stars-web",
          deployment: "production",
          version: "abcdef1",
          msg: "delivery failed for [email]",
          event: "inquiry.failed",
          phone: "[redacted]",
          detail: "timeout",
        },
      },
    ]);
  });

  it("filters by level (info in production, LOG_LEVEL overrides)", () => {
    const prod = capture({ NODE_ENV: "production" });
    prod.logger.debug("hidden");
    prod.logger.info("shown");
    expect(prod.lines.map((l) => l.data.msg)).toEqual(["shown"]);

    const quiet = capture({ NODE_ENV: "production", LOG_LEVEL: "error" });
    quiet.logger.warn("hidden");
    expect(quiet.lines).toHaveLength(0);
  });

  it("accepts console-style arguments and child bindings", () => {
    const { logger, lines } = capture();
    logger.child({ route: "/api/x" }).warn("oops", new Error("boom"));
    logger.info("count", 3);
    expect(lines[0]?.data).toMatchObject({ route: "/api/x", detail: { name: "Error", message: "boom" } });
    expect(lines[1]?.data).toMatchObject({ detail: 3 });
  });
});
