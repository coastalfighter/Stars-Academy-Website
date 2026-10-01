"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/config";
import { currentPath, reportClientError } from "@/lib/observability/clientReport";

/**
 * Reports uncaught errors and unhandled promise rejections from this site's
 * own scripts. Errors from browser extensions, injected scripts and
 * cross-origin frames (reported as "Script error.") are ignored: they are
 * noise the site can't fix, and they could reveal what else a visitor runs.
 */
export function ErrorReporter({ locale }: { locale: Locale }) {
  useEffect(() => {
    const ownScript = (url: string | undefined) => Boolean(url) && url!.startsWith(`${window.location.origin}/_next/`);

    const onError = (event: ErrorEvent) => {
      if (!ownScript(event.filename)) return;
      const error = event.error instanceof Error ? event.error : null;
      reportClientError({
        kind: "unhandled",
        message: error?.message || event.message || "Unknown error",
        path: currentPath(),
        locale,
        source: event.filename,
        line: event.lineno || undefined,
        column: event.colno || undefined,
        stack: error?.stack,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason: unknown = event.reason;
      const error = reason instanceof Error ? reason : null;
      // Without a stack pointing at our bundles, the origin can't be confirmed.
      if (!error?.stack || !error.stack.includes(`${window.location.origin}/_next/`)) return;
      reportClientError({ kind: "rejection", message: error.message || "Unhandled rejection", path: currentPath(), locale, stack: error.stack });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [locale]);

  return null;
}
