import type { Metadata } from "next";
import { StarMark } from "@/components/ui/StarMark";
import { buttonClass } from "@/components/ui/Button";
import { insightsConfig } from "@/lib/analytics/auth";

export const metadata: Metadata = { title: "Staff sign in" };
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  "1": "That password didn’t match. Please try again.",
  rate: "Too many sign-in attempts. Please wait 15 minutes and try again.",
  config: "Insights sign-in isn’t set up yet. Ask your web administrator to set INSIGHTS_PASSWORD and INSIGHTS_SESSION_SECRET.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { error } = await searchParams;
  const configured = insightsConfig() !== null;
  const message = typeof error === "string" ? MESSAGES[error] : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <StarMark className="h-12 w-12" />
        <h1 className="mt-6 font-display text-3xl">Website insights</h1>
        <p className="mt-2 text-ink-soft">Staff sign-in. Visitor numbers are anonymous totals; no personal information is shown here.</p>
        {message ? (
          <p role="alert" className="mt-6 rounded-2xl bg-rose/5 p-4 text-sm font-semibold text-rose-deep">
            {message}
          </p>
        ) : null}
        {configured ? (
          <form method="post" action="/api/insights/login" className="mt-6 space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 block min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base"
              />
            </div>
            <button type="submit" className={buttonClass("primary", "lg", "w-full")}>
              Sign in
            </button>
          </form>
        ) : (
          !message && <p className="mt-6 rounded-2xl bg-ice/60 p-4 text-sm">{MESSAGES.config}</p>
        )}
      </div>
    </div>
  );
}
