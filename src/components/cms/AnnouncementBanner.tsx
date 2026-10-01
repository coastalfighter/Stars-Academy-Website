"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import type { Announcement, AnnouncementKind } from "@/cms/repository";

export const DISMISS_PREFIX = "stars:dismissed:";

const STYLES: Record<AnnouncementKind, string> = {
  urgent: "bg-berry-deep text-white",
  closure: "bg-accent text-ink",
  event: "bg-teal-deep text-white",
  info: "bg-ink-soft text-cream",
};

// useLayoutEffect warns during SSR; this component only measures in the browser.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function readDismissed(id: string): boolean {
  try {
    return window.localStorage.getItem(DISMISS_PREFIX + id) === "1";
  } catch {
    return false;
  }
}

/**
 * The most important active announcement, shown at the top of every page.
 * Lives inside the fixed header; publishes its height as --announce-h so the
 * page content below shifts down by exactly that much.
 */
export function AnnouncementBanner({ announcement, locale }: { announcement: Announcement; locale: Locale }) {
  const t = getDictionary(locale).cms;
  const ref = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Reading the visitor's saved choice is only possible after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(readDismissed(announcement.id));
  }, [announcement.id]);

  useIsoLayoutEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (dismissed || !el) {
      root.style.setProperty("--announce-h", "0px");
      return;
    }
    const update = () => root.style.setProperty("--announce-h", `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--announce-h", "0px");
    };
  }, [dismissed]);

  if (dismissed) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_PREFIX + announcement.id, "1");
    } catch {
      // Storage may be unavailable; the banner still hides for this page view.
    }
    setDismissed(true);
  };

  return (
    <div ref={ref} role="region" aria-label={t.announcementRegion} className={STYLES[announcement.kind]}>
      <div className="container-x flex items-center gap-3 py-2.5 text-sm">
        <span className="hidden shrink-0 rounded-full bg-black/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.14em] sm:inline">
          {t.kinds[announcement.kind]}
        </span>
        <p className="min-w-0 flex-1 leading-snug">
          <strong className="font-semibold" lang={announcement.title.lang}>
            {announcement.title.text}
          </strong>
          {announcement.link ? (
            <>
              {" "}
              <a
                href={announcement.link.href}
                lang={announcement.link.label.lang}
                className="font-semibold underline underline-offset-4"
              >
                {announcement.link.label.text}
              </a>
            </>
          ) : null}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
        >
          <span className="sr-only">{t.dismiss}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
