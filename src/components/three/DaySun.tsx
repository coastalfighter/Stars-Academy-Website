"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Group, type Mesh, type MeshStandardMaterial, type PointLight } from "three";
import { localProgress, smoothstep } from "@/lib/scroll/timeline";
import { sunArc } from "@/lib/scene/slots";
import { easeVis, useSlot } from "./useSlot";
import { sceneState } from "./sceneState";

/**
 * "What one full day actually looks like."
 * The sun travels a 7:00 a.m. → 3:00 p.m. arc inside its slot as the visitor
 * scrolls the day timeline. Its colour shifts from dawn pink to afternoon lilac.
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

  const readSlot = useSlot("day");

  useFrame(() => {
    const r = root.current;
    if (!r) return;
    const { p, elapsed } = sceneState;
    const frame = readSlot();
    r.visible = Boolean(frame);
    if (!frame) return;
    const vis = easeVis(frame.presence);

    // The sun crosses its slot (beside the day's intro, above the timeline cards).
    const t = smoothstep(0.02, 0.98, localProgress(p, DAY_CHAPTER));
    const { u, v } = sunArc(t);
    const { box } = frame;
    const radius = Math.min(box.height * 0.16, box.width * 0.09);
    const x = box.x - box.width / 2 + u * box.width;
    const y = box.y - box.height / 2 + v * box.height;
    const z = 0;

    if (t < 0.5) color.copy(DAWN).lerp(NOON, t * 2);
    else color.copy(NOON).lerp(AFTERNOON, (t - 0.5) * 2);

    if (sun.current) {
      sun.current.position.set(x, y, z);
      sun.current.scale.setScalar(radius * vis);
      const m = sun.current.material as MeshStandardMaterial;
      m.color.copy(color);
      m.emissive.copy(color);
    }
    if (halo.current) {
      halo.current.position.set(x, y, z - 0.4);
      halo.current.scale.setScalar(radius * (2.1 + Math.sin(elapsed * 0.9) * 0.08) * vis);
      const hm = halo.current.material as MeshStandardMaterial;
      hm.opacity = 0.22 * vis;
      hm.color.copy(color);
    }
    if (light.current) {
      light.current.position.set(x, y, z + 2);
      light.current.color.copy(color);
      light.current.intensity = 28 * vis;
    }
  });

  return (
    <group ref={root} visible={false}>
      <mesh ref={sun}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial emissiveIntensity={0.55} toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial transparent depthWrite={false} emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <pointLight ref={light} distance={22} decay={1.6} />
    </group>
  );
}
