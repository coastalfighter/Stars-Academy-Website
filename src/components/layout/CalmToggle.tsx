"use client";

import { useMotion } from "@/components/providers/MotionProvider";

/** Switch for the sensory-friendly calm mode. */
export function CalmToggle({ className = "" }: { className?: string }) {
  const { calm, toggleCalm, ready } = useMotion();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={calm}
      onClick={toggleCalm}
      disabled={!ready}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 text-xs font-semibold text-ink-soft backdrop-blur transition-colors hover:border-ink/30 ${className}`}
      title="Calm mode turns off animation and 3D effects"
    >
      <span
        aria-hidden="true"
        className={`relative inline-block h-5 w-9 rounded-full transition-colors ${calm ? "bg-teal" : "bg-ink/20"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${calm ? "translate-x-[18px]" : "translate-x-0.5"}`}
        />
      </span>
      Calm mode
    </button>
  );
}
