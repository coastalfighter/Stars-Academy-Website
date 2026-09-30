"use client";

import { useEffect } from "react";
import { computeChapterProgress, CHAPTERS, type ChapterRect } from "@/lib/scroll/timeline";
import { setScrollState } from "@/lib/scroll/store";

/**
 * Measures every `[data-chapter]` section and publishes continuous chapter
 * progress on scroll. Layout is re-measured on resize and whenever the
 * document height changes (fonts, images, accordions).
 */
export function ScrollDirector() {
  useEffect(() => {
    let rects: ChapterRect[] = [];
    let ticking = false;

    const measure = () => {
      const y = window.scrollY;
      rects = CHAPTERS.map((id) => {
        const el = document.querySelector<HTMLElement>(`[data-chapter="${id}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top + y, height: r.height };
      }).filter((r): r is ChapterRect => r !== null);
    };

    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      setScrollState(computeChapterProgress(window.scrollY, vh, rects), window.scrollY / max);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();

    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
