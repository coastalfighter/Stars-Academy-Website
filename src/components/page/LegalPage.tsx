import type { ReactNode } from "react";
import { PageHero } from "./PageHero";

/** Plain, readable layout for policy pages. */
export function LegalPage({
  slug,
  crumb,
  eyebrow,
  title,
  lede,
  updated,
  children,
}: {
  slug: string;
  crumb: string;
  eyebrow: string;
  title: string;
  lede?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero crumbs={[{ label: crumb, href: `/${slug}` }]} eyebrow={eyebrow} title={title} lede={lede} star={null} />
      <div className="bg-paper py-16 md:py-20">
        <div className="container-x">
          <div className="prose-stars mx-auto max-w-3xl">
            {children}
            {updated ? <p className="mt-12 text-sm text-muted">Last updated: {updated}</p> : null}
          </div>
        </div>
      </div>
    </>
  );
}
