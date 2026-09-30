"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getProgressSnapshot, subscribeScroll } from "./store";

/**
 * Subscribes a DOM component to a value derived from chapter progress.
 * `select` should return a primitive so React can bail out of re-renders
 * when the derived value hasn't changed.
 */
export function useScrollDerived<T extends string | number | boolean>(select: (progress: number) => T): T {
  const getSnapshot = useCallback(() => select(getProgressSnapshot()), [select]);
  const getServer = useCallback(() => select(0), [select]);
  return useSyncExternalStore(subscribeScroll, getSnapshot, getServer);
}
