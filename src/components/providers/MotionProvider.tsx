"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics/client";

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

/**
 * QA override: set this localStorage key to "true" to render the 3D scene even
 * on a software renderer (used by the E2E suite, which runs without a GPU).
 */
export const FORCE_3D_STORAGE_KEY = "stars:force-3d";

/**
 * Renderers that rasterise WebGL on the CPU. Browsers fall back to these when
 * the GPU is blocklisted or absent; every 3D frame then blocks the main thread
 * (tens of seconds of jank on a mid-range laptop), so the static backdrop is
 * the better experience.
 */
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|lavapipe|software rasterizer|microsoft basic render/i;

export function isSoftwareRenderer(renderer: string): boolean {
  return SOFTWARE_RENDERER.test(renderer);
}

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

/** True when the device can render the 3D scene on real graphics hardware. */
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
    // Release the probe context right away; browsers cap live contexts.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !isSoftwareRenderer(renderer) || readFlag(FORCE_3D_STORAGE_KEY);
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
    track("calm_mode", calm ? "on" : "off");
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
