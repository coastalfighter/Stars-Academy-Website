import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { insightsConfig, SESSION_COOKIE, verifySession } from "@/lib/analytics/auth";
import { loadReport, parseRange } from "@/lib/analytics/load";
import { analyticsEnabled, analyticsStore } from "@/lib/analytics/store";
import { InsightsDashboard } from "@/components/insights/InsightsDashboard";

export const metadata: Metadata = { title: "Website insights" };
export const dynamic = "force-dynamic";

export default async function InsightsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!verifySession(insightsConfig(), token)) redirect("/admin/login");

  const range = parseRange((await searchParams).range);
  const store = analyticsStore();
  const report = await loadReport(range, { store });
  return <InsightsDashboard report={report} range={range} storage={store.kind} enabled={analyticsEnabled()} />;
}
