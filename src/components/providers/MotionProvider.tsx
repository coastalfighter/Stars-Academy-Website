"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Calm mode — a sensory-friendly setting that removes all motion, smooth
 * scrolling and the WebGL scene. It defaults to the OS "reduce motion"
 * preference and can be toggled by the visitor; their choice is remembered.
 *
 * This mirrors STARS' own "sensory-informed" approach: some visitors (and
 * the children on a parent's lap) are overwhelmed by movement.
 */

export const CALM_STORAGE_KEY = "stars:calm-mode";

type MotionContextValue = {
  /** True when motion should be minimised. */
  calm: boolean;
  /** Whether the visitor explicitly chose a setting (vs. OS default). */
  explicit: boolean;
  /** True once the client has resolved preferences (avoids SSR mismatch). */
  ready: boolean;
  /** Whether the device can render the 3D scene. */
  webgl: boolean;
  setCalm: (calm: boolean) => void;
  toggleCalm: () => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function readStored(): boolean | null {
  try {
    const v = window.localStorage.getItem(CALM_STORAGE_KEY);
    return v === null ? null : v === "true";
  } catch {
    return null;
  }
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({ calm: false, explicit: false, ready: false, webgl: false });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stored = readStored();
    // Resolving client-only preferences after hydration is the intended use here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      calm: stored ?? media.matches,
      explicit: stored !== null,
      ready: true,
      webgl: detectWebGL(),
    });

    const onChange = (e: MediaQueryListEvent) => {
      setState((s) => (s.explicit ? s : { ...s, calm: e.matches }));
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!state.ready) return;
    document.documentElement.dataset.calm = String(state.calm);
  }, [state.calm, state.ready]);

  const setCalm = useCallback((calm: boolean) => {
    try {
      window.localStorage.setItem(CALM_STORAGE_KEY, String(calm));
    } catch {
      // Storage can be unavailable (private mode); the in-memory state still applies.
    }
    setState((s) => ({ ...s, calm, explicit: true }));
  }, []);

  const toggleCalm = useCallback(() => setCalm(!state.calm), [setCalm, state.calm]);

  const value = useMemo(() => ({ ...state, setCalm, toggleCalm }), [state, setCalm, toggleCalm]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error("useMotion must be used inside <MotionProvider>");
  return ctx;
}

/** True when rich motion (3D, smooth scroll, parallax) should run. */
export function useRichMotion(): boolean {
  const { calm, ready, webgl } = useMotion();
  return ready && !calm && webgl;
}
