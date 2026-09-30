"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ACESFilmicToneMapping, Color, type Group, type Mesh, type MeshPhysicalMaterial } from "three";
import { damp } from "@/lib/scroll/timeline";
import { services } from "@/content/services";
import { BRAND } from "./sceneState";
import { centerGeometry, pointGeometry, STAR_STEP } from "./starGeometry";

type Props = {
  /** Index of the star point (service) to lift and light; -1 lights all evenly. */
  highlight: number;
};

function Star({ highlight }: Props) {
  const spinner = useRef<Group>(null);
  const points = useRef<(Mesh | null)[]>([]);
  const geos = useMemo(() => ({ points: [0, 1, 2, 3, 4].map(pointGeometry), center: centerGeometry() }), []);
  const colors = useMemo(() => services.map((s) => new Color(s.color)), []);
  const rotation = useRef(highlight >= 0 ? -highlight * STAR_STEP : 0);

  useEffect(
    () => () => {
      geos.points.forEach((g) => g.dispose());
      geos.center.dispose();
    },
    [geos],
  );

  useFrame((state, delta) => {
    const s = spinner.current;
    if (!s) return;
    const dt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const target = highlight >= 0 ? -highlight * STAR_STEP : rotation.current;
    rotation.current = damp(rotation.current, target, 3, dt);
    s.rotation.z = rotation.current + (highlight < 0 ? Math.sin(t * 0.25) * 0.2 : Math.sin(t * 0.5) * 0.04);
    // Gentle tilt toward the pointer, like the star is noticing you.
    s.rotation.y = damp(s.rotation.y, state.pointer.x * 0.35 + Math.sin(t * 0.4) * 0.12, 2.5, dt);
    s.rotation.x = damp(s.rotation.x, -state.pointer.y * 0.25, 2.5, dt);
    s.position.y = Math.sin(t * 0.8) * 0.06;

    points.current.forEach((mesh, k) => {
      if (!mesh) return;
      const on = highlight === k;
      const a = Math.PI / 2 + k * STAR_STEP;
      const lift = on ? 0.26 : 0;
      mesh.position.set(Math.cos(a) * lift, Math.sin(a) * lift, on ? 0.16 : 0);
      const m = mesh.material as MeshPhysicalMaterial;
      m.emissiveIntensity = on ? 0.5 : highlight >= 0 ? 0.03 : 0.12;
    });
  });

  return (
    <group ref={spinner}>
      {geos.points.map((geo, k) => (
        <mesh
          key={k}
          geometry={geo}
          ref={(m) => {
            points.current[k] = m;
          }}
        >
          <meshPhysicalMaterial
            color={colors[k]}
            emissive={colors[k]}
            roughness={0.35}
            clearcoat={0.8}
            clearcoatRoughness={0.25}
          />
        </mesh>
      ))}
      <mesh geometry={geos.center}>
        <meshPhysicalMaterial color="#fff4d6" roughness={0.3} clearcoat={1} emissive={BRAND.gold} emissiveIntensity={0.22} />
      </mesh>
    </group>
  );
}

/** A small, self-contained star canvas for page heroes. Decorative. */
export default function HeroStarCanvas({ highlight }: Props) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.75]}
      camera={{ fov: 30, position: [0, 0, 7.2] }}
      gl={{ antialias: true, alpha: true, toneMapping: ACESFilmicToneMapping }}
    >
      <hemisphereLight args={["#fff8ea", "#c9dcea", 1.15]} />
      <directionalLight position={[4, 6, 6]} intensity={1.6} color="#fff3dc" />
      <directionalLight position={[-6, -2, 3]} intensity={0.45} color="#bfd8ff" />
      <Star highlight={highlight} />
    </Canvas>
  );
}
