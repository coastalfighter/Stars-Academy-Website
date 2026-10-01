"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Group, type Mesh, type MeshPhysicalMaterial } from "three";
import { damp, serviceIndexAt } from "@/lib/scroll/timeline";
import { fitScale } from "@/lib/scene/slots";
import { easeVis, useSlot, type SlotFrame } from "./useSlot";
import { services } from "@/content/services";
import { BRAND, HERO_CLOUD, sceneState } from "./sceneState";
import { centerGeometry, OUTER, pointGeometry, STAR_STEP as STEP } from "./starGeometry";

/**
 * The STARS star, built from five separate points (one per discipline)
 * around a shared centre ("one plan, one team"). It lives in three layout
 * slots: beside the hero, beside the services list (where the active
 * discipline's point turns to the top and glows) and beside the visit
 * invitation, where it glows pink. Whichever slot is on screen holds it.
 */

const PINK = new Color(BRAND.pink);
/** Natural size (world units) of the star, allowing for its lifted points and wobble. */
const STAR_SIZE = 2 * OUTER * 1.18;

type Where = "hero" | "services" | "visit";

export function ServiceStar() {
  const root = useRef<Group>(null);
  const spinner = useRef<Group>(null);
  const points = useRef<(Mesh | null)[]>([]);
  const rotation = useRef(0);
  const lift = useRef<number[]>([0, 0, 0, 0, 0]);
  const readers = { hero: useSlot("hero"), services: useSlot("services"), visit: useSlot("visit") };

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

    let where: Where | null = null;
    let frame: SlotFrame | null = null;
    for (const key of ["hero", "services", "visit"] as const) {
      const f = readers[key]();
      if (f && (!frame || f.presence > frame.presence)) {
        frame = f;
        where = key;
      }
    }
    r.visible = Boolean(frame);
    if (!frame || !where) return;

    // In the hero the star shares its slot with the block cloud, so it is sized with the cloud.
    const fit =
      where === "hero"
        ? fitScale(frame.box, HERO_CLOUD.width, HERO_CLOUD.height) * HERO_CLOUD.starScale
        : fitScale(frame.box, STAR_SIZE, STAR_SIZE);
    r.position.set(frame.box.x, frame.box.y, 0);
    r.scale.setScalar(Math.max(0.001, fit * easeVis(frame.presence)));

    const active = where === "services" ? serviceIndexAt(p, services.length) : -1;
    const target = active >= 0 ? -active * STEP : rotation.current;
    rotation.current = damp(rotation.current, target, 3.2, dt);

    s.rotation.z = rotation.current + (active < 0 ? Math.sin(elapsed * 0.25) * 0.15 : 0);
    s.rotation.y = Math.sin(elapsed * 0.4) * 0.22 + (where === "hero" ? Math.sin(elapsed * 0.18) * 0.5 : 0);
    s.rotation.x = Math.sin(elapsed * 0.3) * 0.08;

    const glow = where === "visit" ? 1 : 0;
    for (let k = 0; k < 5; k += 1) {
      const mesh = points.current[k];
      if (!mesh) continue;
      const on = k === active ? 1 : 0;
      lift.current[k] = damp(lift.current[k] ?? 0, on, 5, dt);
      const l = lift.current[k] ?? 0;
      const a = Math.PI / 2 + k * STEP;
      // The active point eases forward and a touch outward: it stays part of the star.
      mesh.position.set(Math.cos(a) * l * 0.07, Math.sin(a) * l * 0.07, l * 0.3);

      const mat = mesh.material as MeshPhysicalMaterial;
      scratch.copy(baseColors[k] ?? PINK).lerp(PINK, glow * 0.6);
      mat.color.copy(scratch);
      mat.emissive.copy(scratch);
      const dim = active >= 0 ? 0.05 : 0.12;
      mat.emissiveIntensity = dim + l * 0.5 + glow * 0.2;
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
              color={services[k]?.color ?? BRAND.pink}
              roughness={0.35}
              clearcoat={0.8}
              clearcoatRoughness={0.25}
            />
          </mesh>
        ))}
        <mesh geometry={geos.center}>
          <meshPhysicalMaterial color="#fff0fb" roughness={0.3} clearcoat={1} emissive={BRAND.pink} emissiveIntensity={0.22} />
        </mesh>
      </group>
    </group>
  );
}

