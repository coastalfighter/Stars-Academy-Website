import Link from "next/link";
import { site } from "@/content/site";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { href } from "@/i18n/routes";
import { JsonLd } from "@/components/seo/JsonLd";

export type Crumb = { label: string; href: string };

/** Visible breadcrumb trail plus schema.org BreadcrumbList. "Home" is implied. */
export function Breadcrumbs({ items, locale = "en" }: { items: Crumb[]; locale?: Locale }) {
  const d = getDictionary(locale);
  const trail: Crumb[] = [{ label: d.common.home, href: href(locale, "home") }, ...items];
  return (
    <>
      <nav aria-label={d.common.breadcrumb} className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          {trail.map((c, i) => {
            const last = i === trail.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="font-semibold text-ink">
                    {c.label}
                  </span>
                ) : (
                  <>
                    <Link href={c.href} className="underline-offset-4 hover:underline">
                      {c.label}
                    </Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: `${site.url}${c.href === "/" ? "" : c.href}`,
          })),
        }}
      />
    </>
  );
}
