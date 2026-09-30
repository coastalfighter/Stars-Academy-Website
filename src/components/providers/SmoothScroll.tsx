"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useMotion } from "./MotionProvider";

/**
 * Lenis smooth scrolling. It drives *native* scroll position (no scroll
 * hijacking), so keyboard, find-in-page, anchors and assistive tech keep
 * working. Disabled entirely in calm mode.
 */
export function SmoothScroll() {
  const { calm, ready } = useMotion();

  useEffect(() => {
    if (!ready || calm) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: { offset: -80 },
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [calm, ready]);

  return null;
}
