"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { ProgressDriver } from "./ProgressDriver";
import { CameraRig } from "./CameraRig";
import { Blocks } from "./Blocks";
import { ServiceStar } from "./ServiceStar";
import { CareSpheres } from "./CareSpheres";
import { DaySun } from "./DaySun";
import { CalmOrb } from "./CalmOrb";

/** The single, page-wide WebGL canvas. Purely decorative → aria-hidden. */
export default function SceneCanvas() {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.75]}
      camera={{ fov: 35, near: 0.1, far: 60, position: [-2.2, 0.2, 9] }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: ACESFilmicToneMapping,
        outputColorSpace: SRGBColorSpace,
      }}
      style={{ pointerEvents: "none" }}
    >
      <AdaptiveDpr pixelated={false} />
      <ProgressDriver />
      <CameraRig />

      <hemisphereLight args={["#fff8ea", "#c9dcea", 1.15]} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} color="#fff3dc" />
      <directionalLight position={[-6, -2, 3]} intensity={0.45} color="#bfd8ff" />

      <Blocks />
      <ServiceStar />
      <CareSpheres />
      <DaySun />
      <CalmOrb />
    </Canvas>
  );
}
