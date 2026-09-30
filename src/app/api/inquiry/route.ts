import { createInquiryHandler } from "@/lib/inquiry/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createInquiryHandler();

export function GET(): Response {
  return Response.json({ ok: false, error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
