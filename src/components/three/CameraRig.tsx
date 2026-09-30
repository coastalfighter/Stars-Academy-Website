"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { CAMERA_PATH, damp, responsiveCamera, sampleKeyframes } from "@/lib/scroll/timeline";
import { sceneState } from "./sceneState";

/** Moves the camera along the scroll-driven path with gentle pointer parallax. */
export function CameraRig() {
  const { camera, size, pointer } = useThree();
  const look = useRef(new Vector3());
  const parallax = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const sample = responsiveCamera(sampleKeyframes(sceneState.p, CAMERA_PATH), size.width / Math.max(size.height, 1));

    parallax.current.x = damp(parallax.current.x, pointer.x * 0.35, 2.5, dt);
    parallax.current.y = damp(parallax.current.y, pointer.y * 0.2, 2.5, dt);

    camera.position.set(
      sample.position[0] + parallax.current.x,
      sample.position[1] + parallax.current.y,
      sample.position[2],
    );
    look.current.set(sample.target[0], sample.target[1], sample.target[2]);
    camera.lookAt(look.current);
  });

  return null;
}
