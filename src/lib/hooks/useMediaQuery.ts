"use client";

import { useCallback, useSyncExternalStore } from "react";

/** SSR-safe media query hook (false on the server and first client render). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Screens big enough for the pinned, scroll-scrubbed sections: desktop width
 * and at least 640 px tall. Shorter screens get the plain stacked layout,
 * because a pinned panel taller than the screen would spill into the next
 * section.
 */
export const PINNED_QUERY = "(min-width: 64rem) and (min-height: 40rem)";
