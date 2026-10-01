"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { screenToWorld, slotPresence, type ScreenRect, type SlotName, type WorldBox } from "@/lib/scene/slots";

export type SlotFrame = {
  /** The slot as a box on the z = 0 plane, in world units. */
  box: WorldBox;
  /** The slot on screen, in CSS pixels. */
  rect: ScreenRect;
  /** 0–1: how much of the slot is on screen (eased). */
  presence: number;
};

/**
 * A reader for one layout slot, to call inside useFrame. Reading a bounding
 * box once per frame without writing to the DOM doesn't force extra layout.
 * The element is looked up lazily and found again after re-renders (e.g. when
 * a section switches between its pinned and stacked layouts).
 */
export function createSlotReader(name: SlotName, viewport: { width: number; height: number }): () => SlotFrame | null {
  let el: Element | null = null;
  return () => {
    if (!el || !el.isConnected) el = document.querySelector(`[data-scene-slot="${name}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const rect = { left: r.left, top: r.top, width: r.width, height: r.height };
    const presence = slotPresence(rect, viewport);
    if (presence <= 0) return null;
    return { box: screenToWorld(rect, viewport), rect, presence };
  };
}

/** `createSlotReader` for the canvas's current size. */
export function useSlot(name: SlotName): () => SlotFrame | null {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  return useMemo(() => createSlotReader(name, { width, height }), [name, width, height]);
}

/** Smooth 0–1 easing for subjects growing in and out with their slot. */
export const easeVis = (v: number): number => v * v * (3 - 2 * v);
