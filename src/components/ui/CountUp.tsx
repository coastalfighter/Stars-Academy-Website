"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/providers/MotionProvider";

/**
 * Counts up to `value` once when scrolled into view. Renders the final value
 * on the server, in calm mode and to assistive tech (visually hidden text).
 */
export function CountUp({ value, duration = 1600 }: { value: number; duration?: number }) {
  const { calm, ready } = useMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready || calm || started.current) return;
    // Years (e.g. 2009) count from a nearby start rather than zero.
    const from = value > 1000 ? value - 30 : 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(from + (value - from) * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        setDisplay(from);
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration, calm, ready]);

  return (
    <span ref={ref}>
      {/* Screen readers get the final number, not the animation. */}
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
