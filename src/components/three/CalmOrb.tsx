"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { band } from "@/lib/scroll/timeline";
import { BRAND, sceneState } from "./sceneState";

/**
 * "Calm adults help children calm."
 * A slow breathing orb (8-second cycle, a common co-regulation breathing
 * pace) with four companions — one per principle of the STARS approach —
 * orbiting unhurriedly around it.
 */
const COMPANIONS = [BRAND.gold, BRAND.coral, BRAND.teal, BRAND.blue] as const;
const BREATH_SECONDS = 8;

export function CalmOrb() {
  const root = useRef<Group>(null);
  const orb = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const moons = useRef<(Mesh | null)[]>([]);

  useFrame(() => {
    const r = root.current;
    if (!r) return;
    const { p, elapsed } = sceneState;
    const vis = band(p, 4.1, 4.42, 0.25);
    r.visible = vis > 0.002;
    if (!r.visible) return;

    const breath = (1 - Math.cos((elapsed / BREATH_SECONDS) * Math.PI * 2)) / 2; // 0 → 1 → 0
    if (orb.current) {
      orb.current.scale.setScalar((1.05 + breath * 0.16) * vis);
      (orb.current.material as MeshStandardMaterial).emissiveIntensity = 0.18 + breath * 0.22;
    }
    if (ring.current) {
      ring.current.scale.setScalar((1.9 + breath * 0.35) * vis);
      (ring.current.material as MeshStandardMaterial).opacity = (0.35 - breath * 0.2) * vis;
      ring.current.rotation.x = Math.PI / 2.4;
      ring.current.rotation.z = elapsed * 0.05;
    }
    COMPANIONS.forEach((_, i) => {
      const m = moons.current[i];
      if (!m) return;
      const a = elapsed * 0.18 + (i * Math.PI) / 2;
      const rad = 2.25 + breath * 0.2;
      m.position.set(Math.cos(a) * rad, Math.sin(a) * rad * 0.42, Math.sin(a) * rad * 0.6);
      m.scale.setScalar(0.24 * vis);
    });
  });

  return (
    <group ref={root} visible={false}>
      <mesh ref={orb}>
        <icosahedronGeometry args={[1, 6]} />
        <meshStandardMaterial color={BRAND.sky} emissive={BRAND.teal} roughness={0.25} metalness={0.05} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[1, 0.012, 16, 128]} />
        <meshStandardMaterial color={BRAND.teal} transparent depthWrite={false} />
      </mesh>
      {COMPANIONS.map((c, i) => (
        <mesh
          key={c}
          ref={(m) => {
            moons.current[i] = m;
          }}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial color={c} roughness={0.35} clearcoat={0.7} />
        </mesh>
      ))}
    </group>
  );
}
