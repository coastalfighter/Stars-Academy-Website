/**
 * Scene slots: how the 3D scene stays out of the way of the page.
 *
 * Every 3D subject on the home page is anchored to an invisible box in the
 * page layout (an element with `data-scene-slot`). Each frame the scene reads
 * that box's position on screen and places and sizes its subject to fill it.
 * Because the layout reserves the space, a 3D object can never sit on top of
 * text or cards, at any viewport size; and it scrolls with its section like
 * any other element.
 *
 * The camera is fixed (CAMERA_Z units in front of the z = 0 plane, looking
 * straight at it), so converting a screen box into world units is a direct
 * linear mapping. Pure functions only: unit-tested.
 */

export const CAMERA_FOV = 35;
export const CAMERA_Z = 10;

export type SlotName = "hero" | "care" | "day" | "services" | "approach" | "stars" | "visit";

export type ScreenRect = { left: number; top: number; width: number; height: number };
export type Viewport = { width: number; height: number };
export type WorldBox = { x: number; y: number; width: number; height: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Half the height of the visible area, in world units, on the z = 0 plane. */
export function halfHeight(distance = CAMERA_Z, fov = CAMERA_FOV): number {
  return Math.tan(((fov / 2) * Math.PI) / 180) * distance;
}

/** Converts a box on screen (CSS pixels) into a centred box on the z = 0 plane. */
export function screenToWorld(rect: ScreenRect, viewport: Viewport, distance = CAMERA_Z): WorldBox {
  const hh = halfHeight(distance);
  const hw = hh * (viewport.width / Math.max(viewport.height, 1));
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return {
    x: (cx / viewport.width) * 2 * hw - hw,
    y: hh - (cy / viewport.height) * 2 * hh,
    width: (rect.width / viewport.width) * 2 * hw,
    height: (rect.height / viewport.height) * 2 * hh,
  };
}

/** Uniform scale that fits a subject of natural size `w` × `h` inside the box. */
export function fitScale(box: WorldBox, w: number, h: number): number {
  return Math.max(0, Math.min(box.width / w, box.height / h));
}

/**
 * How present a slot is on screen, 0–1: the share of its height inside the
 * viewport, eased so subjects grow in as their slot arrives and shrink away
 * as it leaves. Hidden slots (display: none) have no size and return 0.
 */
export function slotPresence(rect: ScreenRect, viewport: Viewport): number {
  if (rect.width <= 0 || rect.height <= 0) return 0;
  const visible = Math.min(rect.top + rect.height, viewport.height) - Math.max(rect.top, 0);
  const share = clamp01(visible / Math.min(rect.height, viewport.height));
  return share * share * (3 - 2 * share);
}

/**
 * Arrival progress for subjects that animate in once (the S·T·A·R·S blocks):
 * 0 while the slot's top is below `start` × viewport height, 1 once it has
 * risen to `end` × viewport height.
 */
export function arrival(rect: ScreenRect, viewport: Viewport, start = 0.95, end = 0.45): number {
  const y = rect.top / Math.max(viewport.height, 1);
  return clamp01((start - y) / Math.max(start - end, 1e-6));
}

/**
 * Where the sun sits inside the day slot for day progress `t` (0 = 7:00 a.m.,
 * 1 = 3:00 p.m.): `u` runs left → right, `v` bottom → top, both 0–1. It rises
 * on the left, peaks at midday and sets on the right, always inside the slot.
 */
export function sunArc(t: number): { u: number; v: number } {
  const c = clamp01(t);
  return { u: 0.1 + 0.8 * c, v: 0.18 + 0.64 * Math.sin(Math.PI * c) };
}
