"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGUAGE_NAME, HTML_LANG, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { counterpartPath, href } from "@/i18n/routes";

/**
 * Links to the same page in the other language. When a page has no
 * translation (e.g. English-only careers), it links to the other language's
 * home page and says so in its accessible name.
 */
export function LanguageSwitcher({ locale, className = "" }: { locale: Locale; className?: string }) {
  const pathname = usePathname() ?? "/";
  const target: Locale = locale === "en" ? "es" : "en";
  const d = getDictionary(locale).language;
  const match = counterpartPath(pathname, target);

  return (
    <Link
      href={match ?? href(target, "home")}
      hrefLang={HTML_LANG[target]}
      data-track={`language_switch:${target}`}
      lang={HTML_LANG[target]}
      aria-label={match ? d.switchAria : d.siteAria}
      className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-ink/10 bg-white/70 px-3.5 text-xs font-bold text-ink-soft backdrop-blur transition-colors hover:border-ink/30 hover:text-ink ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      {LANGUAGE_NAME[target]}
    </Link>
  );
}
