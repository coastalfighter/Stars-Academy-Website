"use client";

import type { ReactNode } from "react";
import { useMotion } from "@/components/providers/MotionProvider";
import { services } from "@/content/services";
import { StarSpikes } from "./HeroStar";

/**
 * Flat stand-ins for the 3D scene. The home page reserves space for the 3D
 * objects (the star, the care spheres, the S·T·A·R·S blocks); when the scene
 * doesn't run (calm mode, reduced motion, no WebGL) these fill that space so
 * it never reads as an empty gap. They render only after hydration and fit
 * inside space the sections already reserve, so they never shift the layout.
 */
function useFlat(): boolean {
  const { ready, calm, webgl } = useMotion();
  return ready && (calm || !webgl);
}

/** Right-hand column that keeps its art centred in the viewport while the section scrolls. */
function Side({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" data-flat-scene className="pointer-events-none absolute inset-y-0 right-0 hidden w-[45%] lg:block">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center">{children}</div>
    </div>
  );
}

/** The five-spike star, on the right of a section, at desktop widths. */
export function FlatStar() {
  if (!useFlat()) return null;
  return (
    <Side>
      <StarSpikes className="h-[min(26rem,60vh)] w-[min(26rem,60vh)] animate-float-slow" />
    </Side>
  );
}

/** Therapy, learning and care: three overlapping soft spheres. */
export function FlatSpheres() {
  if (!useFlat()) return null;
  const sphere = "absolute h-56 w-56 rounded-full shadow-[0_24px_48px_-16px_rgb(163_19_122/0.25)]";
  return (
    <Side>
      <div className="relative h-[28rem] w-[28rem] animate-float-slow">
        <span className={`${sphere} left-6 top-10 bg-[radial-gradient(circle_at_30%_30%,#fff,var(--color-pink)_70%)]`} />
        <span className={`${sphere} right-6 top-10 bg-[radial-gradient(circle_at_30%_30%,#fff,var(--color-lilac)_70%)] mix-blend-multiply`} />
        <span className={`${sphere} bottom-6 left-1/2 -translate-x-1/2 bg-[radial-gradient(circle_at_30%_30%,#fff,var(--color-azure)_75%)] mix-blend-multiply`} />
      </div>
    </Side>
  );
}

/**
 * The five letter blocks, lined up as S·T·A·R·S in the service colours. A
 * normal flex child: the section's reserved height already has room for it.
 */
export function FlatLetterBlocks({ letters }: { letters: readonly string[] }) {
  if (!useFlat()) return null;
  return (
    <div aria-hidden="true" data-flat-scene className="pointer-events-none flex justify-center gap-2 sm:gap-4">
      {letters.map((letter, i) => (
        <span
          key={i}
          className="flex h-14 w-14 items-center justify-center rounded-2xl font-display text-3xl text-ink shadow-[0_18px_32px_-14px_rgb(23_21_58/0.35)] sm:h-24 sm:w-24 sm:rounded-3xl sm:text-5xl"
          style={{ background: services[i]?.color, transform: `rotate(${(i - 2) * 3}deg)` }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
