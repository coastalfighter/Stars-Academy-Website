"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group, CanvasTexture } from "three";
import { clamp, easeInOutCubic, lerp } from "@/lib/scroll/timeline";
import { arrival, fitScale } from "@/lib/scene/slots";
import { easeVis, useSlot, type SlotFrame } from "./useSlot";
import { BRAND, HERO_CLOUD, sceneState } from "./sceneState";
import { createLetterTexture } from "./letterTexture";

/**
 * "We build it one block at a time." (STARS)
 *
 * Soft toy blocks float around the star in the hero slot. Further down, the
 * five lettered blocks drop into the S·T·A·R·S slot one after another.
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
    // An even ring around the star (the hero slot keeps the whole cloud clear of the copy).
    const angle = Math.PI / 2 + (i / total) * Math.PI * 2 + (rand() - 0.5) * 0.22;
    const radius = 2.15 + rand() * 0.85;
    const isLetter = i < LETTERS.length;
    specs.push({
      letter: isLetter ? LETTERS[i] : undefined,
      color: isLetter ? (LETTER_COLORS[i] as string) : (FILLER_COLORS[i % FILLER_COLORS.length] as string),
      size: isLetter ? 0.78 : 0.36 + rand() * 0.34,
      cloud: [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.66, (rand() - 0.5) * 2.4],
      spin: [(rand() - 0.5) * 0.5, (rand() - 0.5) * 0.6, (rand() - 0.5) * 0.3],
      bob: rand() * Math.PI * 2,
      // A gentle staircase: each letter a little higher, like a block tower being built.
      stack: isLetter ? [(i - 2) * 0.98, Math.abs(i - 2) * -0.12 + (i % 2) * 0.14 + 0.1, 0] : undefined,
    });
  }
  return specs;
}

type Frames = { hero: SlotFrame | null; stars: SlotFrame | null; viewport: { width: number; height: number } };

/** Stack layout (world units at scale 1): five blocks side by side, plus headroom for the landing. */
const STACK = { width: 5.2, height: 1.8 } as const;

function Block({ spec, index, frames }: { spec: BlockSpec; index: number; frames: MutableRefObject<Frames> }) {
  const group = useRef<Group>(null);
  const texture = useMemo<CanvasTexture | null>(
    () => (spec.letter && typeof document !== "undefined" ? createLetterTexture(spec.letter, BRAND.ink) : null),
    [spec.letter],
  );

  useEffect(() => () => texture?.dispose(), [texture]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const { elapsed } = sceneState;
    const { hero, stars, viewport } = frames.current;

    // Stars slot: the letters land one by one ("one block at a time").
    if (spec.stack && stars) {
      const land = arrival(stars.rect, viewport, 0.92, 0.38);
      const t = easeInOutCubic(clamp((land - index * 0.1) / 0.6));
      const k = fitScale(stars.box, STACK.width, STACK.height);
      const [sx, sy, sz] = spec.stack;
      const fromY = sy + 2.6;
      g.position.set(
        stars.box.x + sx * k,
        stars.box.y + lerp(fromY, sy + Math.sin(elapsed * 0.9 + index) * 0.03, t) * k,
        sz + (1 - t) * -1.2,
      );
      const tumble = 1 - t;
      g.rotation.set(
        spec.spin[0] * elapsed * tumble + Math.sin(elapsed * 0.6 + index) * 0.04,
        spec.spin[1] * elapsed * tumble + Math.sin(elapsed * 0.5 + index) * 0.08 * t,
        spec.spin[2] * elapsed * tumble,
      );
      const scale = spec.size * k * t * stars.presence;
      g.scale.setScalar(Math.max(0.001, scale));
      g.visible = scale > 0.002;
      return;
    }

    // Hero slot: the cloud floats around the star.
    if (hero) {
      const k = fitScale(hero.box, HERO_CLOUD.width, HERO_CLOUD.height);
      const bob = Math.sin(elapsed * 0.7 + spec.bob) * 0.12;
      g.position.set(hero.box.x + spec.cloud[0] * k, hero.box.y + (spec.cloud[1] + bob) * k, spec.cloud[2] * k);
      g.rotation.set(spec.spin[0] * elapsed, spec.spin[1] * elapsed, spec.spin[2] * elapsed);
      const scale = spec.size * k * easeVis(hero.presence);
      g.scale.setScalar(Math.max(0.001, scale));
      g.visible = scale > 0.002;
      return;
    }

    g.visible = false;
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
  const readHero = useSlot("hero");
  const readStars = useSlot("stars");
  const size = useThree((s) => s.size);
  const frames = useRef<Frames>({ hero: null, stars: null, viewport: { width: 1, height: 1 } });

  // Read both slots once per frame, before the blocks move (negative priority runs first).
  useFrame(() => {
    frames.current = { hero: readHero(), stars: readStars(), viewport: { width: size.width, height: size.height } };
  }, -0.5);

  return (
    <group>
      {specs.map((spec, i) => (
        <Block key={i} spec={spec} index={i} frames={frames} />
      ))}
    </group>
  );
}
