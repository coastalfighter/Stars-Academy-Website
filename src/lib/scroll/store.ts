/**
 * A tiny external store for scroll progress.
 *
 * The WebGL scene reads `scrollState.progress` every frame without causing
 * React re-renders. DOM widgets that need to react (progress rail, day
 * timeline highlight) subscribe through `useSyncExternalStore` and only get
 * notified when the value changes by a meaningful amount.
 */

type Listener = () => void;

export const scrollState = {
  /** Continuous chapter progress (see computeChapterProgress). */
  progress: 0,
  /** 0–1 progress through the whole document. */
  page: 0,
};

const listeners = new Set<Listener>();
let lastNotified = { progress: Number.NaN, page: Number.NaN };
const EPSILON = 0.004;

export function setScrollState(progress: number, page: number): void {
  scrollState.progress = progress;
  scrollState.page = page;
  if (
    Math.abs(progress - lastNotified.progress) > EPSILON ||
    Math.abs(page - lastNotified.page) > EPSILON ||
    Number.isNaN(lastNotified.progress)
  ) {
    lastNotified = { progress, page };
    listeners.forEach((l) => l());
  }
}

export function subscribeScroll(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getProgressSnapshot = (): number => scrollState.progress;
export const getPageSnapshot = (): number => scrollState.page;
export const getServerSnapshot = (): number => 0;

/** Test helper: resets the store between test cases. */
export function resetScrollState(): void {
  scrollState.progress = 0;
  scrollState.page = 0;
  lastNotified = { progress: Number.NaN, page: Number.NaN };
  listeners.clear();
}
