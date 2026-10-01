"use client";

import { useEffect } from "react";
import "./globals.css";
import { fraunces, figtree } from "./fonts";
import { errorCopy } from "@/i18n/errorCopy";
import { site } from "@/content/site";
import { buttonClass } from "@/components/ui/Button";
import { StarMark } from "@/components/ui/StarMark";
import { currentPath, reportClientError } from "@/lib/observability/clientReport";

/**
 * Last-resort error page, used only when a root layout itself fails. It
 * replaces the whole document, so it is bilingual and self-contained, like
 * global-not-found. Plain links (not next/link) do a full reload, which is
 * what recovery from a broken layout needs.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const en = errorCopy.en;
  const es = errorCopy.es;

  useEffect(() => {
    const path = currentPath();
    reportClientError({
      kind: "boundary",
      message: error.message || error.name || "Unknown error",
      digest: error.digest,
      path,
      locale: path === "/es" || path.startsWith("/es/") ? "es" : "en",
      stack: error.stack,
    });
  }, [error]);

  const phone = (
    <a href={site.phone.href} className="whitespace-nowrap font-semibold text-ink underline underline-offset-4">
      {site.phone.display}
    </a>
  );

  return (
    <html lang="en-US" className={`${fraunces.variable} ${figtree.variable}`}>
      <body>
        <title>Something went wrong · Algo salió mal | STARS Academy</title>
        <main className="container-x flex min-h-screen flex-col items-center justify-center gap-14 py-20 text-center">
          <StarMark className="h-16 w-16" />
          <section className="max-w-xl">
            <h1 className="display-md">{en.title}</h1>
            <p className="lede mt-3">
              {en.body} {phone}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => retry()} className={buttonClass("primary", "lg")}>
                {en.retry}
              </button>
              {/* A full page load on purpose: the client router may be what broke. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className={buttonClass("ghost", "lg")}>
                {en.home}
              </a>
            </div>
          </section>
          <section lang="es-US" className="max-w-xl border-t border-line pt-14">
            <h2 className="display-md">{es.title}</h2>
            <p className="lede mt-3">
              {es.body} {phone}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => retry()} className={buttonClass("primary", "lg")}>
                {es.retry}
              </button>
              <a href="/es" className={buttonClass("ghost", "lg")}>
                {es.home}
              </a>
            </div>
          </section>
          {error.digest ? (
            <p className="text-sm text-muted">
              Ref. <span className="font-mono">{error.digest}</span>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
