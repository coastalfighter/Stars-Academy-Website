"use client";

import { useSyncExternalStore } from "react";
import { getPageSnapshot, getServerSnapshot, subscribeScroll } from "@/lib/scroll/store";

/** Thin reading-progress bar at the very top of the page (decorative). */
export function ScrollRail() {
  const page = useSyncExternalStore(subscribeScroll, getPageSnapshot, getServerSnapshot);
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        className="h-full origin-left bg-gradient-to-r from-accent via-coral to-teal"
        style={{ transform: `scaleX(${page})` }}
      />
    </div>
  );
}
