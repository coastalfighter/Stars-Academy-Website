"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Group, type Mesh, type MeshPhysicalMaterial } from "three";
import { band, damp, serviceIndexAt } from "@/lib/scroll/timeline";
import { services } from "@/content/services";
import { BRAND, sceneState } from "./sceneState";
import { centerGeometry, pointGeometry, STAR_STEP as STEP } from "./starGeometry";

/**
 * The STARS star, built from five separate points — one per discipline —
 * around a shared centre ("one plan, one team"). In the services chapter the
 * active point lifts, glows and rotates to the top in sync with the list.
 */

const GOLD = new Color(BRAND.gold);

export function ServiceStar() {
  const root = useRef<Group>(null);
  const spinner = useRef<Group>(null);
  const points = useRef<(Mesh | null)[]>([]);
  const rotation = useRef(0);
  const lift = useRef<number[]>([0, 0, 0, 0, 0]);

  const geos = useMemo(() => ({ points: [0, 1, 2, 3, 4].map(pointGeometry), center: centerGeometry() }), []);
  const baseColors = useMemo(() => services.map((s) => new Color(s.color)), []);
  const scratch = useMemo(() => new Color(), []);

  useEffect(
    () => () => {
      geos.points.forEach((g) => g.dispose());
      geos.center.dispose();
    },
    [geos],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const { p, elapsed } = sceneState;
    const r = root.current;
    const s = spinner.current;
    if (!r || !s) return;

    const heroVis = band(p, -1, 0.2, 0.75);
    const servicesVis = band(p, 3.0, 3.95, 0.25);
    const visitVis = band(p, 6.02, 7, 0.3);
    const vis = Math.max(heroVis, servicesVis, visitVis);
    r.visible = vis > 0.002;
    if (!r.visible) return;

    const baseScale = heroVis * 0.72 + servicesVis * 0.92 + visitVis * 1.1;
    r.scale.setScalar(Math.max(0.001, Math.min(baseScale, 1.25) * easeVis(vis)));

    const active = servicesVis > 0.5 ? serviceIndexAt(p, services.length) : -1;
    const target = active >= 0 ? -active * STEP : rotation.current;
    rotation.current = damp(rotation.current, target, 3.2, dt);

    s.rotation.z = rotation.current + (active < 0 ? Math.sin(elapsed * 0.25) * 0.15 : 0);
    s.rotation.y = Math.sin(elapsed * 0.4) * 0.22 + (1 - servicesVis) * elapsed * 0.12 * (heroVis > 0 ? 1 : 0);
    s.rotation.x = Math.sin(elapsed * 0.3) * 0.08;

    for (let k = 0; k < 5; k += 1) {
      const mesh = points.current[k];
      if (!mesh) continue;
      const on = k === active ? 1 : 0;
      lift.current[k] = damp(lift.current[k] ?? 0, on, 5, dt);
      const l = lift.current[k] ?? 0;
      const a = Math.PI / 2 + k * STEP;
      mesh.position.set(Math.cos(a) * l * 0.28, Math.sin(a) * l * 0.28, l * 0.18);

      const mat = mesh.material as MeshPhysicalMaterial;
      scratch.copy(baseColors[k] ?? GOLD).lerp(GOLD, visitVis);
      mat.color.copy(scratch);
      mat.emissive.copy(scratch);
      const dim = active >= 0 ? 0.04 : 0.12;
      mat.emissiveIntensity = dim + l * 0.55 + visitVis * 0.25;
    }
  });

  return (
    <group ref={root} visible={false}>
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
              color={services[k]?.color ?? BRAND.gold}
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
    </group>
  );
}

function easeVis(v: number): number {
  return v * v * (3 - 2 * v);
}
