/**
 * Scroll → scene timeline math.
 *
 * The home page is split into "chapters" (DOM sections tagged with
 * `data-chapter`). Native scroll position is converted into a single
 * continuous number `p` where the integer part is the chapter index and the
 * fraction is how far the reading line has travelled through that chapter.
 * Every 3D object derives its state from `p` with the pure helpers below,
 * which keeps the scene deterministic and unit-testable.
 */

export const CHAPTERS = ["hero", "care", "day", "services", "approach", "stars", "visit"] as const;
export type ChapterId = (typeof CHAPTERS)[number];

export const chapterIndex = (id: ChapterId): number => CHAPTERS.indexOf(id);

export type ChapterRect = { top: number; height: number };
export type Vec3 = readonly [number, number, number];

export const clamp = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const easeInOutCubic = (t: number): number => {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

/**
 * Frame-rate independent exponential smoothing.
 * `lambda` ≈ responsiveness (higher = snappier). `dt` in seconds.
 */
export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * Math.max(0, dt)));

/**
 * Converts scroll position into chapter progress.
 *
 * The "reading line" sits at `readingLine` × viewport height (default: the
 * vertical centre). Before the first chapter → 0, after the last → N.
 * If the reading line is in a gap between two chapters, progress holds at
 * the boundary so the scene never jumps.
 */
export function computeChapterProgress(
  scrollY: number,
  viewportHeight: number,
  rects: readonly ChapterRect[],
  readingLine = 0.5,
): number {
  if (rects.length === 0) return 0;
  const probe = scrollY + viewportHeight * readingLine;

  for (let i = 0; i < rects.length; i += 1) {
    const r = rects[i];
    if (!r) continue;
    if (probe < r.top) return i; // before this chapter (or in the gap preceding it)
    const end = r.top + Math.max(r.height, 1);
    if (probe < end) return i + (probe - r.top) / Math.max(r.height, 1);
  }
  return rects.length;
}

/** Progress (0–1) inside chapter `index` given global progress `p`. */
export const localProgress = (p: number, index: number): number => clamp(p - index);

/**
 * Visibility envelope: 0 → 1 while `p` rises through [start - fade, start],
 * holds 1 until `end`, then falls to 0 by `end + fade`.
 */
export function band(p: number, start: number, end: number, fade = 0.35): number {
  const rise = fade <= 0 ? (p >= start ? 1 : 0) : smoothstep(start - fade, start, p);
  const fall = fade <= 0 ? (p <= end ? 1 : 0) : 1 - smoothstep(end, end + fade, p);
  return clamp(Math.min(rise, fall));
}

/** Index of the active item when a 0–1 progress is divided into `count` equal steps. */
export const activeIndex = (t: number, count: number): number => {
  if (count <= 0) return -1;
  return Math.min(count - 1, Math.max(0, Math.floor(clamp(t) * count)));
};

/** STARS is open 7:00–15:00. Maps chapter progress to a fractional hour. */
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 15;
export const dayHourAt = (t: number): number => lerp(DAY_START_HOUR, DAY_END_HOUR, clamp(t));

export const formatHour = (hour: number): string => {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  const suffix = h >= 12 ? "p.m." : "a.m.";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
};

/**
 * Position of the sun on a semicircular arc for a given hour.
 * 7:00 → rising on the left, 11:00 → zenith, 15:00 → setting on the right.
 */
export function sunPosition(hour: number, radius = 6, depth = -6): Vec3 {
  const t = clamp((hour - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR));
  const angle = Math.PI * (1 - t); // π → 0
  return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.6 - 0.5, depth];
}

export type CameraKey = { p: number; position: Vec3; target: Vec3 };

const lerpVec = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/**
 * Samples an ordered list of camera keyframes at progress `p`, easing between
 * neighbouring keys. Values outside the range clamp to the first/last key.
 */
export function sampleKeyframes(p: number, keys: readonly CameraKey[]): { position: Vec3; target: Vec3 } {
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (!first || !last) return { position: [0, 0, 8], target: [0, 0, 0] };
  if (p <= first.p) return { position: first.position, target: first.target };
  if (p >= last.p) return { position: last.position, target: last.target };

  for (let i = 0; i < keys.length - 1; i += 1) {
    const a = keys[i];
    const b = keys[i + 1];
    if (a && b && p >= a.p && p <= b.p) {
      const t = easeInOutCubic((p - a.p) / Math.max(b.p - a.p, 1e-6));
      return { position: lerpVec(a.position, b.position, t), target: lerpVec(a.target, b.target, t) };
    }
  }
  return { position: last.position, target: last.target };
}

/**
 * Camera path through the home page. Scene subjects live around the world
 * origin; on desktop the camera looks to the LEFT of them so they render in
 * the right-hand half and the copy column on the left stays legible.
 */
export const CAMERA_PATH: readonly CameraKey[] = [
  { p: 0, position: [-2.2, 0.2, 9], target: [-2.4, 0, 0] },
  { p: 1, position: [-2, 0.5, 8.4], target: [-2.3, 0.2, 0] },
  { p: 2, position: [-0.6, 1.2, 10], target: [-0.8, 1.2, -4] },
  { p: 3, position: [-2.6, 0, 8.2], target: [-2.4, 0, 0] },
  { p: 4, position: [-1.8, -0.3, 9.4], target: [-2.2, -0.1, 0] },
  { p: 5, position: [0, 0.2, 8.8], target: [0, -1.25, 0] },
  { p: 5.6, position: [0, 0.2, 8.8], target: [0, -1.25, 0] },
  { p: 6, position: [-1.6, 0.4, 11], target: [-2, 0.2, 0] },
];

/**
 * Narrow (portrait) viewports centre the subject horizontally, lift it into
 * the upper part of the screen and pull the camera back so it fits.
 */
export function responsiveCamera(
  sample: { position: Vec3; target: Vec3 },
  aspect: number,
): { position: Vec3; target: Vec3 } {
  if (aspect >= 1) return sample;
  const narrow = clamp((1 - aspect) / 0.5); // 0 at square, 1 at portrait 1:2
  const [px, py, pz] = sample.position;
  const [tx, ty, tz] = sample.target;
  const shiftX = lerp(0, -tx, narrow);
  return {
    position: [px + shiftX, py, pz + narrow * 4.5],
    target: [tx + shiftX, ty - narrow * 1.6, tz],
  };
}

/** Chapter indices used by both the DOM and the 3D scene. */
export const SERVICES_CHAPTER = chapterIndex("services");
export const DAY_CHAPTER = chapterIndex("day");

/**
 * Which service is highlighted while scrolling through the services chapter.
 * Shared by the 3D star and the DOM list so they never disagree.
 */
export const serviceIndexAt = (p: number, count: number): number =>
  activeIndex(smoothstep(0.02, 0.98, localProgress(p, SERVICES_CHAPTER)), count);

/** Which "day at STARS" moment is active while scrolling the day chapter. */
export const dayIndexAt = (p: number, count: number): number =>
  activeIndex(localProgress(p, DAY_CHAPTER), count);
