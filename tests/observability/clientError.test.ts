import { createClientErrorHandler, errorFingerprint } from "@/lib/observability/clientErrorHandler";
import { createLogger } from "@/lib/observability/logger";
import { MemoryRateLimitStore } from "@/lib/security/rateLimit";
import type { AlertSender } from "@/lib/observability/alert";

function setup() {
  const lines: Record<string, unknown>[] = [];
  const alert = vi.fn<AlertSender>(async () => "sent");
  const handler = createClientErrorHandler({
    env: {} as NodeJS.ProcessEnv,
    logger: createLogger({ sink: (_l, line) => lines.push(JSON.parse(line) as Record<string, unknown>) }),
    alert,
    store: new MemoryRateLimitStore(),
    max: 3,
    now: () => 1000,
  });
  return { handler, lines, alert };
}

const post = (data: unknown, headers: Record<string, string> = {}) =>
  new Request("https://stars.test/api/client-error", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://stars.test", ...headers },
    body: typeof data === "string" ? data : JSON.stringify(data),
  });

const boundary = { kind: "boundary", message: "Cannot read properties of undefined (reading 'map') for a@b.co", path: "/families", locale: "en" };

describe("POST /api/client-error", () => {
  it("logs a redacted report and alerts on a client-side render failure", async () => {
    const { handler, lines, alert } = setup();
    expect((await handler(post(boundary))).status).toBe(204);
    expect(lines[0]).toMatchObject({ event: "client.error", kind: "boundary", path: "/families", level: "error" });
    expect(JSON.stringify(lines)).not.toContain("a@b.co");
    // The diagnostic itself survives redaction (only the address inside it is masked).
    expect(lines[0]?.errorMessage).toBe("Cannot read properties of undefined (reading 'map') for [email]");
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ severity: "warning" }));
  });

  it("doesn't alert for server-originated or stray errors", async () => {
    const { handler, alert } = setup();
    await handler(post({ ...boundary, digest: "2391043852" }));
    await handler(post({ ...boundary, kind: "unhandled" }));
    expect(alert).not.toHaveBeenCalled();
  });

  it("only accepts same-origin, well-formed, small, unhurried reports", async () => {
    const { handler } = setup();
    expect((await handler(post(boundary, { origin: "https://evil.test" }))).status).toBe(403);
    expect((await handler(post(boundary, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await handler(post("{"))).status).toBe(400);
    expect((await handler(post({ ...boundary, path: "https://evil.test/" }))).status).toBe(422);
    expect((await handler(post({ ...boundary, message: "x".repeat(9000) }))).status).toBe(413);
    expect((await handler(post(boundary))).status).toBe(429);
  });

  it("fingerprints the same bug the same way", () => {
    expect(errorFingerprint("Chunk 4821 failed (id 9f8e7d6c5b)")).toBe(errorFingerprint("Chunk 17 failed (id 0a1b2c3d4e)"));
  });
});

describe("browser report normalisation", () => {
  it("always produces a body the endpoint accepts", async () => {
    const { normalizeReport } = await import("@/lib/observability/clientReport");
    const { clientErrorSchema } = await import("@/lib/observability/clientErrorSchema");
    const messy = normalizeReport({
      kind: "unhandled",
      message: "m".repeat(5000),
      digest: "not a digest!",
      path: "relative/path",
      locale: "es",
      source: "s".repeat(1000),
      line: -1,
      column: 1.5,
      stack: "x".repeat(10_000),
    });
    expect(clientErrorSchema.safeParse(messy).success).toBe(true);
    expect(messy).toMatchObject({ path: "/", digest: undefined, line: undefined, column: undefined });
  });
});
