"use client";

import { useFrame } from "@react-three/fiber";
import { damp } from "@/lib/scroll/timeline";
import { scrollState } from "@/lib/scroll/store";
import { sceneState } from "./sceneState";

/** Runs before every other frame subscriber (negative priority). */
export function ProgressDriver() {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1); // avoid jumps after a backgrounded tab
    sceneState.elapsed += dt;
    sceneState.p = damp(sceneState.p, scrollState.progress, 4.5, dt);
  }, -1);
  return null;
}
