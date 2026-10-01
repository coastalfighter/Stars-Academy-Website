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

export const formatHour = (hour: number, locale: "en" | "es" = "en"): string => {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  const pm = h >= 12;
  // AP style in English; RAE style ("a. m.") in Spanish.
  const suffix = locale === "es" ? (pm ? "p. m." : "a. m.") : pm ? "p.m." : "a.m.";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
};

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
