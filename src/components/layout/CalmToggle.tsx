"use client";

import { useMotion } from "@/components/providers/MotionProvider";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";

/** Switch for the sensory-friendly calm mode. */
/**
 * `compact` hides the visible label until very wide screens; the switch keeps
 * its accessible name either way.
 */
export function CalmToggle({
  locale = "en",
  className = "",
  compact = false,
}: {
  locale?: Locale;
  className?: string;
  compact?: boolean;
}) {
  const { calm, toggleCalm, ready } = useMotion();
  const t = getDictionary(locale).calm;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={calm}
      onClick={toggleCalm}
      disabled={!ready}
      className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-ink/10 bg-white/70 px-3 text-xs font-semibold text-ink-soft backdrop-blur transition-colors hover:border-ink/30 ${className}`}
      title={t.title}
    >
      <span
        aria-hidden="true"
        className={`relative inline-block h-5 w-9 rounded-full transition-colors ${calm ? "bg-accent-strong" : "bg-ink/20"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${calm ? "translate-x-[18px]" : "translate-x-0.5"}`}
        />
      </span>
      <span className={compact ? "sr-only 2xl:not-sr-only" : undefined}>{t.label}</span>
    </button>
  );
}
