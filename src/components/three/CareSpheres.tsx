"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { band, lerp, localProgress, smoothstep } from "@/lib/scroll/timeline";
import { BRAND, sceneState } from "./sceneState";

/**
 * "Not a daycare. Not a therapy clinic. Both, working as one."
 * Classroom, therapy and nursing start apart and converge into one overlap —
 * the glowing core where they meet is the child.
 */
const RINGS = [
  { color: BRAND.gold, angle: Math.PI / 2 },
  { color: BRAND.teal, angle: Math.PI / 2 + (2 * Math.PI) / 3 },
  { color: BRAND.berry, angle: Math.PI / 2 + (4 * Math.PI) / 3 },
] as const;

const CARE_CHAPTER = 1;

export function CareSpheres() {
  const root = useRef<Group>(null);
  const spheres = useRef<(Mesh | null)[]>([]);
  const core = useRef<Mesh>(null);

  useFrame(() => {
    const r = root.current;
    if (!r) return;
    const { p, elapsed } = sceneState;
    const vis = band(p, 0.72, 1.7, 0.28);
    r.visible = vis > 0.002;
    if (!r.visible) return;

    const local = localProgress(p, CARE_CHAPTER);
    const converge = smoothstep(0.1, 0.62, local);
    const radius = lerp(2.5, 0.78, converge);

    RINGS.forEach((ring, i) => {
      const mesh = spheres.current[i];
      if (!mesh) return;
      const wobble = Math.sin(elapsed * 0.8 + i * 2) * 0.05 * (1 - converge);
      mesh.position.set(Math.cos(ring.angle) * (radius + wobble), Math.sin(ring.angle) * (radius + wobble) * 0.92, 0);
      mesh.scale.setScalar(1.18 * smoothstep(0, 1, vis));
      (mesh.material as MeshStandardMaterial).opacity = 0.5 * vis;
    });

    if (core.current) {
      const glow = smoothstep(0.5, 0.8, local) * vis;
      const pulse = 1 + Math.sin(elapsed * 1.6) * 0.07;
      core.current.scale.setScalar(Math.max(0.001, 0.36 * glow * pulse));
    }
    r.rotation.z = Math.sin(elapsed * 0.2) * 0.05;
  });

  return (
    <group ref={root} visible={false}>
      {RINGS.map((ring, i) => (
        <mesh
          key={ring.color}
          ref={(m) => {
            spheres.current[i] = m;
          }}
        >
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial
            color={ring.color}
            emissive={ring.color}
            emissiveIntensity={0.18}
            roughness={0.3}
            transparent
            opacity={0.5}
            depthWrite={false}
          />
        </mesh>
      ))}
      <mesh ref={core} position={[0, 0, 0.9]}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial color="#fff6d6" emissive={BRAND.gold} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  );
}
