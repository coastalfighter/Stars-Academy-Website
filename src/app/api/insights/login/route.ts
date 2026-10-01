import { createLoginHandler } from "@/lib/analytics/insightsHandlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createLoginHandler();
