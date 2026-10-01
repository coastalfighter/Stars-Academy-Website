"use client";

import { useEffect, useState } from "react";
import { browserSignalsOptOut, isOptedOut, setOptedOut } from "@/lib/analytics/client";

export type OptOutCopy = { title: string; on: string; off: string; browserOff: string; switchLabel: string };

/**
 * Lets a visitor switch website counting off (or back on) for this browser.
 * When the browser already sends GPC / Do Not Track, counting is off and the
 * switch says why instead of offering a choice that wouldn't apply.
 */
export function AnalyticsOptOut({ copy }: { copy: OptOutCopy }) {
  const [state, setState] = useState<{ ready: boolean; counting: boolean; browserBlocked: boolean }>({
    ready: false,
    counting: true,
    browserBlocked: false,
  });

  useEffect(() => {
    // Reading browser-only preferences after hydration is the intended use here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ ready: true, counting: !isOptedOut(), browserBlocked: browserSignalsOptOut() });
  }, []);

  const toggle = () => {
    const counting = !state.counting;
    setOptedOut(!counting);
    setState((s) => ({ ...s, counting }));
  };

  return (
    <div className="mt-6 rounded-[var(--radius-card)] border border-line bg-cream p-6">
      <h3 className="font-display text-xl text-ink">{copy.title}</h3>
      {state.browserBlocked ? (
        <p className="mt-2 text-base text-ink-soft">{copy.browserOff}</p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={state.counting}
              disabled={!state.ready}
              onClick={toggle}
              className="inline-flex min-h-11 items-center gap-3 rounded-full border border-ink/15 bg-white px-4 text-base font-semibold text-ink hover:border-ink/40 disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className={`relative h-6 w-10 rounded-full transition-colors ${state.counting ? "bg-accent-deep" : "bg-ink/25"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${state.counting ? "translate-x-[1.125rem]" : "translate-x-0.5"}`}
                />
              </span>
              {copy.switchLabel}
            </button>
          </div>
          <p className="mt-3 text-sm text-muted" role="status">
            {state.ready ? (state.counting ? copy.on : copy.off) : ""}
          </p>
        </>
      )}
    </div>
  );
}
