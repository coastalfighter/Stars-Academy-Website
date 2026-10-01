"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { damp } from "@/lib/scroll/timeline";
import { CAMERA_Z } from "@/lib/scene/slots";

/** How far (world units) the camera drifts with the pointer: a hint of depth, never enough to leave a slot. */
const PARALLAX = 0.12;

/**
 * The camera stays square-on to the page so layout slots map exactly onto the
 * scene (src/lib/scene/slots.ts). It only drifts slightly with the pointer;
 * the drift is a pure sideways move, so subjects keep their slot while blocks
 * at different depths shift a little against each other.
 */
export function CameraRig() {
  const { camera, pointer } = useThree();
  const drift = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    drift.current.x = damp(drift.current.x, pointer.x * PARALLAX, 2.5, dt);
    drift.current.y = damp(drift.current.y, pointer.y * PARALLAX * 0.6, 2.5, dt);
    camera.position.set(drift.current.x, drift.current.y, CAMERA_Z);
    camera.lookAt(drift.current.x, drift.current.y, 0);
  });

  return null;
}
