import { createLogoutHandler } from "@/lib/analytics/insightsHandlers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createLogoutHandler();
