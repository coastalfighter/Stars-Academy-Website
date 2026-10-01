"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

/** Shown only to editors previewing unpublished CMS changes. */
export function DraftModeBar({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).cms;
  const pathname = usePathname() ?? "/";
  return (
    <div role="status" className="fixed bottom-4 left-4 z-[70] flex items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-cream shadow-[var(--shadow-lift)]">
      <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-gold" />
      {t.previewActive}
      <a
        href={`/api/draft-mode/disable?redirect=${encodeURIComponent(pathname)}`}
        className="rounded-full bg-cream/10 px-3 py-1 font-semibold underline-offset-4 hover:underline"
      >
        {t.exitPreview}
      </a>
    </div>
  );
}
