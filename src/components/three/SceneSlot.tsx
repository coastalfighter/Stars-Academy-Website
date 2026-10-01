"use client";

import type { ReactNode } from "react";
import { useMotion } from "@/components/providers/MotionProvider";
import { services } from "@/content/services";
import type { SlotName } from "@/lib/scene/slots";
import { StarSpikes } from "./HeroStar";

/**
 * Layout slots for the home page's 3D scene (see src/lib/scene/slots.ts).
 *
 * Each slot is an empty, aria-hidden box that reserves space in the layout.
 * With the 3D scene running, the scene draws its subject inside the box; in
 * calm mode, with reduced motion or without WebGL, the box shows a flat
 * version instead. Either way nothing is ever drawn over text or cards.
 */

/** True once we know the 3D scene won't run, so the flat art should show. */
function useFlat(): boolean {
  const { ready, calm, webgl } = useMotion();
  return ready && (calm || !webgl);
}

type Art = "star" | "spheres" | "orb";

/**
 * A slot in the right-hand column of a section. It stays centred in the
 * viewport while the section scrolls past (sticky), so the subject keeps
 * company with the copy beside it. Desktop only: on narrower screens there is
 * no free column, and a subject behind the copy would only make it harder to
 * read, so the slot is hidden and nothing is drawn.
 */
export function SideSlot({ name, art }: { name: SlotName; art: Art }) {
  const flat = useFlat();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] lg:block xl:w-[46%]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center pt-24">
        <div data-scene-slot={name} className="relative aspect-square w-[min(88%,62svh)]">
          {flat ? <FlatArt art={art} /> : null}
        </div>
      </div>
    </div>
  );
}

/** A slot that takes part in the normal flow (the S·T·A·R·S blocks). */
export function InlineSlot({ name, className = "", children }: { name: SlotName; className?: string; children?: ReactNode }) {
  const flat = useFlat();
  return (
    <div aria-hidden="true" data-scene-slot={name} className={`pointer-events-none relative ${className}`}>
      {flat ? children : null}
    </div>
  );
}

function FlatArt({ art }: { art: Art }) {
  if (art === "star") return <StarSpikes className="h-full w-full animate-float-slow" />;
  if (art === "spheres") return <FlatSpheres />;
  return <FlatOrb />;
}

const SPHERE = "absolute h-1/2 w-1/2 rounded-full shadow-[0_24px_48px_-16px_rgb(163_19_122/0.25)]";

/** Therapy, learning and care: three overlapping soft spheres. */
function FlatSpheres() {
  return (
    <div className="relative h-full w-full animate-float-slow">
      <span className={`${SPHERE} left-[6%] top-[10%] bg-[radial-gradient(circle_at_30%_30%,#fff,var(--color-pink)_70%)]`} />
      <span className={`${SPHERE} right-[6%] top-[10%] bg-[radial-gradient(circle_at_30%_30%,#fff,var(--color-lilac)_70%)] mix-blend-multiply`} />
      <span className={`${SPHERE} bottom-[6%] left-1/4 bg-[radial-gradient(circle_at_30%_30%,#fff,var(--color-azure)_75%)] mix-blend-multiply`} />
    </div>
  );
}

/** "Calm adults help children calm": a still orb inside a soft ring. */
function FlatOrb() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <span className="absolute h-[78%] w-[78%] rounded-full border border-accent-strong/30" />
      <span className="h-[44%] w-[44%] rounded-full bg-[radial-gradient(circle_at_32%_30%,#fff,var(--color-ice)_45%,var(--color-lilac)_100%)] shadow-[0_24px_48px_-16px_rgb(106_45_181/0.35)]" />
    </div>
  );
}

/** The five letter blocks, lined up as S·T·A·R·S in the service colours. */
export function FlatLetterBlocks({ letters }: { letters: readonly string[] }) {
  return (
    <div className="flex h-full items-center justify-center gap-2 sm:gap-4">
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
