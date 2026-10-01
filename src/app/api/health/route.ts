import { healthReport } from "@/lib/observability/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

/** Uptime probe: 200 when healthy, 503 when visitors are affected. */
export function GET(): Response {
  const report = healthReport();
  return Response.json(report, { status: report.status === "ok" ? 200 : 503, headers });
}

export function HEAD(): Response {
  return new Response(null, { status: healthReport().status === "ok" ? 200 : 503, headers });
}
