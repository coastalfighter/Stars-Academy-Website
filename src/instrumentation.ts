import type { Instrumentation } from "next";

/**
 * Server-side error capture. Next.js calls `onRequestError` for every
 * uncaught error while rendering a page, running a route handler or a server
 * action. Each one is logged (`event: "server.error"`) and, when
 * ALERT_WEBHOOK_URL is set, raised as a throttled alert.
 *
 * Modules are imported lazily so this file stays cheap to load and never
 * runs Node-only code in the Edge runtime.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const [{ logger }, { sendAlert }, { safeUrl }] = await Promise.all([
    import("@/lib/observability/logger"),
    import("@/lib/observability/alert"),
    import("@/lib/observability/redact"),
  ]);

  const err = error instanceof Error ? error : new Error(String(error));
  const digest = (err as Error & { digest?: string }).digest;
  const path = safeUrl(request.path) ?? "unknown";

  logger.error("Server error", {
    event: "server.error",
    error: err,
    digest,
    method: request.method,
    path,
    route: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    revalidateReason: context.revalidateReason,
  });

  await sendAlert({
    fingerprint: `server-error:${context.routePath}:${err.name}:${err.message.slice(0, 80)}`,
    severity: "critical",
    title: `Server error on ${context.routePath} (${context.routeType})`,
    details: { errorMessage: err.message, digest, path, method: request.method },
  });
};
