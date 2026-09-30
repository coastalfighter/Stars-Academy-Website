"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRichMotion } from "@/components/providers/MotionProvider";
import { services } from "@/content/services";

const HeroStarCanvas = dynamic(() => import("./HeroStarCanvas"), { ssr: false, loading: () => null });

/**
 * Decorative star for page heroes. Rich devices get the interactive 3D star
 * (only mounted while on screen, to save battery); calm mode and no-WebGL
 * devices get an equivalent static SVG.
 */
export function HeroStar({ highlight = -1, className = "" }: { highlight?: number; className?: string }) {
  const rich = useRichMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !rich) return;
    const io = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [rich]);

  return (
    <div ref={ref} aria-hidden="true" className={`relative ${className}`}>
      {rich && visible ? <HeroStarCanvas highlight={highlight} /> : <StaticStar highlight={highlight} />}
    </div>
  );
}

function StaticStar({ highlight }: { highlight: number }) {
  // Five triangular points around a pentagon, matching the 3D build.
  const cx = 50;
  const cy = 52;
  const outer = 44;
  const inner = 18.5;
  const step = (Math.PI * 2) / 5;
  const pt = (r: number, a: number) => `${(cx + Math.cos(a) * r).toFixed(2)},${(cy - Math.sin(a) * r).toFixed(2)}`;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-xl">
      {services.map((s, k) => {
        const a = Math.PI / 2 + k * step;
        return (
          <polygon
            key={s.slug}
            points={`${pt(inner, a - step / 2)} ${pt(outer, a)} ${pt(inner, a + step / 2)}`}
            fill={s.color}
            opacity={highlight >= 0 && highlight !== k ? 0.55 : 1}
          />
        );
      })}
      <polygon
        points={[0, 1, 2, 3, 4].map((k) => pt(inner, Math.PI / 2 + k * step + step / 2)).join(" ")}
        fill="#fff4d6"
      />
    </svg>
  );
}
