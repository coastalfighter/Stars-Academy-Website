import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { isValidPreviewSecret, safeRedirect } from "@/cms/preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Opened by the Studio's Preview action: /api/draft-mode/enable?secret=…&redirect=/es/familias */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (!(await isValidPreviewSecret(url.searchParams.get("secret")))) {
    return new Response("Preview link is invalid or has expired. Open it again from the Studio.", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }
  (await draftMode()).enable();
  redirect(safeRedirect(url.searchParams.get("redirect")));
}
