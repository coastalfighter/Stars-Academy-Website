import type { ReactNode } from "react";
import { PageHero } from "./PageHero";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import type { Crumb } from "./Breadcrumbs";

/** Plain, readable layout for policy pages. */
export function LegalPage({
  locale = "en",
  crumbHref,
  crumb,
  eyebrow,
  title,
  lede,
  updated,
  children,
}: {
  locale?: Locale;
  crumbHref: string;
  crumb: string;
  eyebrow: string;
  title: string;
  lede?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: crumb, href: crumbHref } satisfies Crumb]} eyebrow={eyebrow} title={title} lede={lede} star={null} />
      <div className="bg-paper py-16 md:py-20">
        <div className="container-x">
          <div className="prose-stars mx-auto max-w-3xl">
            {children}
            {updated ? <p className="mt-12 text-sm text-muted">{getDictionary(locale).common.lastUpdated}: {updated}</p> : null}
          </div>
        </div>
      </div>
    </>
  );
}
