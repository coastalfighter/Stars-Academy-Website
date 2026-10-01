import { revalidateTag } from "next/cache";
import { createRevalidateHandler } from "@/cms/revalidateHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createRevalidateHandler({ revalidate: revalidateTag });
