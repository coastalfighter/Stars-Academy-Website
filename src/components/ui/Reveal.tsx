"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

type RevealTag = "div" | "li" | "ol" | "ul" | "dl" | "section" | "p";

type RevealProps = {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  id?: string;
};

/**
 * Fades content up when it enters the viewport. Content is fully visible
 * without JavaScript and in calm / reduced-motion modes (see globals.css).
 */
export function Reveal({ as = "div", children, className, delay = 0, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.dataset.revealed = "true";
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealed = "true";
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // All RevealTag options are plain HTMLElements, so a single ref type is safe.
  const Tag = as as "div";
  return (
    <Tag
      ref={ref as RefObject<HTMLDivElement>}
      id={id}
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
