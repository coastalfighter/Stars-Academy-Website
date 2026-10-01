"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group, CanvasTexture } from "three";
import { band, clamp, easeInOutCubic, lerp, smoothstep } from "@/lib/scroll/timeline";
import { BRAND, sceneState } from "./sceneState";
import { createLetterTexture } from "./letterTexture";

/**
 * "We build it one block at a time." — STARS
 *
 * Soft toy blocks float around the hero. In the "stars" chapter the five
 * lettered blocks glide in, one after another, and stack into S·T·A·R·S.
 */

const LETTERS = ["S", "T", "A", "R", "S"] as const;
const LETTER_COLORS = [BRAND.pink, BRAND.lilac, BRAND.periwinkle, BRAND.azure, BRAND.rose] as const;
const FILLER_COLORS = [BRAND.pink, BRAND.ice, BRAND.periwinkle, BRAND.lilac, BRAND.cream, BRAND.azure, BRAND.rose, BRAND.sand];

/** Deterministic PRNG so the composition is identical on every visit. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type BlockSpec = {
  letter?: string;
  color: string;
  size: number;
  cloud: [number, number, number];
  spin: [number, number, number];
  bob: number;
  stack?: [number, number, number];
};

function buildBlocks(): BlockSpec[] {
  const rand = mulberry32(2009); // the year STARS was founded
  const specs: BlockSpec[] = [];
  const total = 13;
  for (let i = 0; i < total; i += 1) {
    // A C-shaped arc wrapping the right-hand side of the star, so blocks never
    // sit behind the headline on the left or the navigation at the top.
    const angle = -0.72 * Math.PI + (i / (total - 1)) * 1.44 * Math.PI + (rand() - 0.5) * 0.18;
    const radius = 2.2 + rand() * 1.1;
    const isLetter = i < LETTERS.length;
    specs.push({
      letter: isLetter ? LETTERS[i] : undefined,
      color: isLetter ? (LETTER_COLORS[i] as string) : (FILLER_COLORS[i % FILLER_COLORS.length] as string),
      size: isLetter ? 0.78 : 0.36 + rand() * 0.34,
      cloud: [Math.cos(angle) * radius + 0.3, Math.max(-1.9, Math.min(1.35, Math.sin(angle) * radius * 0.62)), (rand() - 0.5) * 2.4],
      spin: [(rand() - 0.5) * 0.5, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.3],
      bob: rand() * Math.PI * 2,
      // A gentle staircase: each letter a little higher, like a block tower being built.
      stack: isLetter ? [(i - 2) * 0.98, -0.55 + Math.abs(i - 2) * -0.12 + (i % 2) * 0.14, 0] : undefined,
    });
  }
  return specs;
}

function Block({ spec, index }: { spec: BlockSpec; index: number }) {
  const group = useRef<Group>(null);
  const size = useThree((s) => s.size);
  // Portrait screens can't fit five blocks side by side at full size.
  const fit = clamp((size.width / Math.max(size.height, 1)) / 0.95, 0.52, 1);
  const texture = useMemo<CanvasTexture | null>(
    () => (spec.letter && typeof document !== "undefined" ? createLetterTexture(spec.letter, BRAND.ink) : null),
    [spec.letter],
  );

  useEffect(() => () => texture?.dispose(), [texture]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const { p, elapsed } = sceneState;

    // Hero: visible at the top, drifting outward as the visitor scrolls on.
    const heroVis = band(p, -1, 0.25, 0.8);
    const scatter = 1 + smoothstep(0, 1.1, p) * 0.9;

    // Stars chapter: letters arrive one by one ("one block at a time").
    let stackT = 0;
    if (spec.stack) {
      const arrive = smoothstep(4.82, 5.4, p);
      const staggered = clamp((arrive - index * 0.1) / 0.6);
      const leave = 1 - smoothstep(5.88, 6.3, p);
      stackT = easeInOutCubic(staggered) * leave;
    }

    const scale = Math.max(heroVis, stackT * fit) * spec.size;
    g.visible = scale > 0.002;
    if (!g.visible) return;

    const bob = Math.sin(elapsed * 0.7 + spec.bob) * 0.12;
    const cx = spec.cloud[0] * scatter;
    const cy = spec.cloud[1] * scatter + bob;
    const cz = spec.cloud[2];

    if (spec.stack && stackT > 0) {
      // Arrive from above the stack position, landing softly.
      const sx = spec.stack[0] * fit;
      const sy = spec.stack[1];
      const sz = spec.stack[2];
      const from = heroVis > 0 ? [cx, cy, cz] : [sx * 1.6, sy + 3.2, sz - 1.5];
      g.position.set(
        lerp(from[0] as number, sx, stackT),
        lerp(from[1] as number, sy + Math.sin(elapsed * 0.9 + index) * 0.03, stackT),
        lerp(from[2] as number, sz, stackT),
      );
      const tumble = 1 - stackT;
      g.rotation.set(
        spec.spin[0] * elapsed * tumble + Math.sin(elapsed * 0.6 + index) * 0.04,
        spec.spin[1] * elapsed * tumble + Math.sin(elapsed * 0.5 + index) * 0.08 * stackT,
        spec.spin[2] * elapsed * tumble,
      );
    } else {
      g.position.set(cx, cy, cz);
      g.rotation.set(spec.spin[0] * elapsed, spec.spin[1] * elapsed, spec.spin[2] * elapsed);
    }
    g.scale.setScalar(scale);
  });

  return (
    <group ref={group} visible={false}>
      <RoundedBox args={[1, 1, 1]} radius={0.16} smoothness={4} castShadow={false}>
        <meshPhysicalMaterial color={spec.color} roughness={0.42} clearcoat={0.6} clearcoatRoughness={0.35} />
      </RoundedBox>
      {texture ? (
        <mesh position={[0, 0, 0.505]}>
          <planeGeometry args={[0.82, 0.82]} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

export function Blocks() {
  const specs = useMemo(() => buildBlocks(), []);
  return (
    <group position={[0, 0.2, 0]}>
      {specs.map((spec, i) => (
        <Block key={i} spec={spec} index={i} />
      ))}
    </group>
  );
}
