import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { safeRedirect } from "@/cms/preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  (await draftMode()).disable();
  redirect(safeRedirect(new URL(request.url).searchParams.get("redirect")));
}
