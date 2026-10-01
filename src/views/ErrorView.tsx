"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import { errorCopy } from "@/i18n/errorCopy";
import { href } from "@/i18n/routes";
import { site } from "@/content/site";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { StarMark } from "@/components/ui/StarMark";
import { currentPath, reportClientError } from "@/lib/observability/clientReport";

export type ErrorViewProps = {
  locale: Locale;
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * Shown when a page fails to render. Keeps the site's header and footer
 * (it renders inside the language's root layout), offers a retry, and puts
 * the phone number front and centre, because a family trying to reach the
 * clinic must always have a way to do so.
 */
export function ErrorView({ locale, error, retry }: ErrorViewProps) {
  const t = errorCopy[locale];
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Move focus so screen-reader users hear that the page changed.
    heading.current?.focus();
    reportClientError({
      kind: "boundary",
      message: error.message || error.name || "Unknown error",
      digest: error.digest,
      path: currentPath(),
      locale,
      stack: error.stack,
    });
  }, [error, locale]);

  return (
    <div className="container-x flex min-h-[80vh] flex-col items-center justify-center pt-32 pb-20 text-center">
      <StarMark className="h-16 w-16" />
      <h1 ref={heading} tabIndex={-1} className="display-lg mt-8 outline-none">
        {t.title}
      </h1>
      <p className="lede mt-4 max-w-xl">
        {t.body}{" "}
        <a href={site.phone.href} className="whitespace-nowrap font-semibold text-ink underline underline-offset-4">
          {site.phone.display}
        </a>
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => retry()} className={buttonClass("primary", "lg")}>
          {t.retry}
        </button>
        <ButtonLink href={href(locale, "home")} size="lg" variant="ghost">
          {t.home}
        </ButtonLink>
      </div>
      {error.digest ? (
        <p className="mt-10 text-sm text-muted">
          Ref. <span className="font-mono">{error.digest}</span>
        </p>
      ) : null}
    </div>
  );
}
