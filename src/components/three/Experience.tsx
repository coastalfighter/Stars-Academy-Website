"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { useRichMotion } from "@/components/providers/MotionProvider";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false, loading: () => null });

/** If WebGL throws (driver issues, context loss) fall back silently to the static backdrop. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[STARS] 3D scene disabled:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * True once the browser has finished the critical work of loading the page.
 * The scene is purely decorative, so it waits for an idle moment rather than
 * competing with hydration and the first paint of the copy.
 */
function useIdle(timeout = 2500): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setIdle(true), 200);
    return () => window.clearTimeout(id);
  }, [timeout]);
  return idle;
}

/**
 * Fixed background layer for the home page. Rich devices get the 3D scene;
 * calm mode, reduced motion, no-WebGL and software-rendering devices get a
 * soft static backdrop.
 */
export function Experience() {
  const rich = useRichMotion();
  const idle = useIdle();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <StaticBackdrop />
      {rich && idle ? (
        <div className="absolute inset-0">
          <SceneBoundary>
            <SceneCanvas />
          </SceneBoundary>
        </div>
      ) : null}
    </div>
  );
}

function StaticBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -left-32 top-1/3 h-[34rem] w-[34rem] rounded-full bg-teal/10 blur-3xl" />
      <div className="absolute bottom-[-12rem] right-1/4 h-[30rem] w-[30rem] rounded-full bg-sky/70 blur-3xl" />
    </div>
  );
}
