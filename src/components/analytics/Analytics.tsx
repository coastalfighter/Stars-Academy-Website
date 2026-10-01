"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { eventForClick, setAnalyticsEnabled, track, trackPageview } from "@/lib/analytics/client";

/**
 * Privacy-friendly, first-party analytics: one beacon per page view and per
 * meaningful interaction, sent to this site only. Rendered by the layout
 * only when analytics is enabled on the server.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    setAnalyticsEnabled(true);
    const onClick = (e: MouseEvent) => {
      const hit = eventForClick(e.target);
      if (hit) track(hit.name, hit.detail);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      setAnalyticsEnabled(false);
    };
  }, []);

  useEffect(() => {
    trackPageview();
  }, [pathname]);

  return null;
}
