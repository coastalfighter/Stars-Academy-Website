import { createCspReportHandler } from "@/lib/csp/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createCspReportHandler();

export function GET(): Response {
  return Response.json({ ok: false, error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
