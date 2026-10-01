import { logger as defaultLogger, type Logger } from "@/lib/observability/logger";
import { readBody } from "@/lib/security/body";
import { isAllowedOrigin } from "@/lib/security/origin";
import { checkRateLimit, clientIp, createRateLimitStore, type RateLimitStore } from "@/lib/security/rateLimit";
import {
  clearedSessionCookie,
  createSession,
  insightsConfig,
  isHttps,
  passwordMatches,
  sessionCookie,
  sessionFromRequest,
  verifySession,
} from "./auth";
import { loadReport, parseRange } from "./load";
import { reportCsv } from "./report";
import type { AnalyticsStore } from "./store";

const LOGIN = "/admin/login";
const DASHBOARD = "/admin/insights";

/** 303 so the browser follows with a GET after a form POST. */
const seeOther = (location: string, cookie?: string) =>
  new Response(null, {
    status: 303,
    headers: { Location: location, "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) },
  });

type Deps = { env?: NodeJS.ProcessEnv; logger?: Logger; rateStore?: RateLimitStore; now?: () => number };

/**
 * POST /api/insights/login (a plain HTML form, so it works without JS).
 * Same-origin only; 10 attempts per IP per 15 minutes (successful ones
 * included, so a correct guess can't slip past the limit), shared across
 * instances when Upstash is configured. Failures never log the attempt.
 */
export function createLoginHandler({ env = process.env, logger = defaultLogger, rateStore, now = Date.now }: Deps = {}) {
  const store = rateStore ?? createRateLimitStore(env, { logger });
  return async function POST(request: Request): Promise<Response> {
    if (!isAllowedOrigin(request, env)) return new Response(null, { status: 403 });
    const config = insightsConfig(env);
    if (!config) return seeOther(`${LOGIN}?error=config`);

    const limit = await checkRateLimit(store, `insights-login:${clientIp(request.headers)}`, { max: 10, windowMs: 15 * 60_000, now: now() });
    if (!limit.allowed) {
      logger.warn("insights login rate limited", { event: "insights.login-limited" });
      return seeOther(`${LOGIN}?error=rate`);
    }

    const body = await readBody(request, 2048);
    const password = body.ok ? (new URLSearchParams(body.text).get("password") ?? "") : "";
    if (!password || !passwordMatches(config, password)) {
      logger.warn("insights login failed", { event: "insights.login-failed" });
      return seeOther(`${LOGIN}?error=1`);
    }
    logger.info("insights login", { event: "insights.login" });
    return seeOther(DASHBOARD, sessionCookie(createSession(config, now()), { secure: isHttps(request) }));
  };
}

/** POST /api/insights/logout */
export function createLogoutHandler({ env = process.env }: Deps = {}) {
  return function POST(request: Request): Response {
    if (!isAllowedOrigin(request, env)) return new Response(null, { status: 403 });
    return seeOther(LOGIN, clearedSessionCookie(isHttps(request)));
  };
}

/** GET /api/insights/export?range=30: the report as CSV, for spreadsheets and board reports. */
export function createExportHandler({ env = process.env, store, now = Date.now }: Deps & { store?: AnalyticsStore } = {}) {
  return async function GET(request: Request): Promise<Response> {
    if (!verifySession(insightsConfig(env), sessionFromRequest(request), now())) {
      return new Response("Sign in to export insights.", { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    const range = parseRange(new URL(request.url).searchParams.get("range"));
    const report = await loadReport(range, { ...(store ? { store } : {}), now: now() });
    return new Response(reportCsv(report), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="stars-website-insights-${report.from}-to-${report.to}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  };
}
