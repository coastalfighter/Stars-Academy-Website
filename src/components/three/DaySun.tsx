"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Group, type Mesh, type MeshStandardMaterial, type PointLight } from "three";
import { band, dayHourAt, localProgress, smoothstep, sunPosition } from "@/lib/scroll/timeline";
import { sceneState } from "./sceneState";

/**
 * "What one full day actually looks like."
 * The sun travels a 7:00 a.m. → 3:00 p.m. arc as the visitor scrolls the day
 * timeline. Its colour warms from dawn to afternoon.
 */
const DAY_CHAPTER = 2;
const DAWN = new Color("#ffa8d8");
const NOON = new Color("#ffe3fa");
const AFTERNOON = new Color("#d9b8ff");


export function DaySun() {
  const root = useRef<Group>(null);
  const sun = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const light = useRef<PointLight>(null);
  const color = useMemo(() => new Color(), []);

  useFrame(() => {
    const r = root.current;
    if (!r) return;
    const { p, elapsed } = sceneState;
    const vis = band(p, 1.95, 2.9, 0.3);
    r.visible = vis > 0.002;
    if (!r.visible) return;

    const t = smoothstep(0.02, 0.98, localProgress(p, DAY_CHAPTER));
    const hour = dayHourAt(t);
    const [x, y, z] = sunPosition(hour, 5.2, -5);

    if (t < 0.5) color.copy(DAWN).lerp(NOON, t * 2);
    else color.copy(NOON).lerp(AFTERNOON, (t - 0.5) * 2);

    if (sun.current) {
      sun.current.position.set(x, y + 0.6, z);
      sun.current.scale.setScalar(0.85 * vis);
      const m = sun.current.material as MeshStandardMaterial;
      m.color.copy(color);
      m.emissive.copy(color);
    }
    if (halo.current) {
      halo.current.position.set(x, y + 0.6, z - 0.4);
      halo.current.scale.setScalar((1.9 + Math.sin(elapsed * 0.9) * 0.08) * vis);
      const hm = halo.current.material as MeshStandardMaterial;
      hm.opacity = 0.22 * vis;
      hm.color.copy(color);
    }
    if (light.current) {
      light.current.position.set(x, y + 0.6, z + 2);
      light.current.color.copy(color);
      light.current.intensity = 28 * vis;
    }
    r.position.y = (1 - vis) * -1.5;
  });

  return (
    <group ref={root} visible={false}>
      <mesh ref={sun}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial emissiveIntensity={1.25} toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial transparent depthWrite={false} emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <pointLight ref={light} distance={22} decay={1.6} />
    </group>
  );
}
