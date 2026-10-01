import type { Row } from "@/lib/analytics/report";

/**
 * Dashboard chart primitives. Server-rendered SVG/HTML, no chart library and
 * no client JavaScript. One hue (the accent) for magnitude throughout: nothing on
 * this dashboard is categorical, so colour never has to carry identity.
 * Text always uses ink tokens; every chart has a table equivalent.
 */

const nf = new Intl.NumberFormat("en-US");
export const formatNumber = (n: number) => nf.format(n);

/**
 * Axis maximum at or above `n` whose half is also a whole, round number
 * (0 · 20 · 40, 0 · 300 · 600), so all three ticks read cleanly.
 */
export function niceMax(n: number): number {
  if (n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  const step = [1, 2, 4, 6, 8, 10].find((s) => s * pow >= n) ?? 10;
  return step * pow;
}

const shortDay = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

/** Column with a 4px rounded data end, square at the baseline. */
function columnPath(x: number, y: number, w: number, h: number): string {
  if (h <= 0) return "";
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export function ColumnChart({ title, data, unit, unitOne }: { title: string; data: { day: string; value: number }[]; unit: string; unitOne: string }) {
  const W = 720;
  const H = 220;
  const pad = { top: 24, right: 8, bottom: 28, left: 44 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const slot = plotW / Math.max(1, data.length);
  const barW = Math.max(2, Math.min(24, slot * 0.62));
  const ticks = [0, max / 2, max];
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));
  const total = data.reduce((t, d) => t + d.value, 0);

  return (
    <figure className="card p-5 sm:p-6">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold text-ink">{title}</span>
        <span className="text-sm text-muted">
          {formatNumber(total)} {total === 1 ? unitOne : unit} in total
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={`${title}: ${formatNumber(total)} ${unit} over ${data.length} days. A table follows.`}>
        {ticks.map((t) => {
          const y = pad.top + plotH - (t / max) * plotH;
          return (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="var(--color-line)" strokeWidth="1" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="12" fill="var(--color-muted)" className="tabular-nums">
                {formatNumber(Math.round(t))}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / max) * plotH;
          const x = pad.left + i * slot + (slot - barW) / 2;
          const y = pad.top + plotH - h;
          return (
            <g key={d.day} className="group">
              <title>{`${shortDay(d.day)}: ${formatNumber(d.value)} ${d.value === 1 ? unitOne : unit}`}</title>
              {/* Hit target: the whole slot, taller than the mark. */}
              <rect x={pad.left + i * slot} y={pad.top} width={slot} height={plotH} fill="transparent" />
              <path d={columnPath(x, y, barW, h)} fill="var(--color-accent-strong)" className="transition-colors group-hover:fill-[var(--color-accent-deep)]" />
              <text
                x={x + barW / 2}
                y={Math.max(12, y - 6)}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="var(--color-ink)"
                className="pointer-events-none opacity-0 group-hover:opacity-100"
              >
                {formatNumber(d.value)}
              </text>
              {i % labelEvery === 0 || i === data.length - 1 ? (
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="var(--color-muted)">
                  {shortDay(d.day)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-semibold text-ink-soft">Show as table</summary>
        <table className="mt-3 w-full text-left">
          <thead>
            <tr className="text-muted">
              <th scope="col" className="py-1 font-semibold">
                Day
              </th>
              <th scope="col" className="py-1 text-right font-semibold">
                {unit[0]?.toUpperCase()}
                {unit.slice(1)}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.day} className="border-t border-line">
                <td className="py-1">{shortDay(d.day)}</td>
                <td className="py-1 text-right tabular-nums">{formatNumber(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** A ranked breakdown: label, a magnitude bar, the count and its share. */
export function BarTable({ title, rows, unit, empty = "Nothing recorded in this period yet.", limit = 10 }: { title: string; rows: Row[]; unit: string; empty?: string; limit?: number }) {
  const total = rows.reduce((t, r) => t + r.count, 0);
  const max = Math.max(1, ...rows.map((r) => r.count));
  const shown = rows.slice(0, limit);
  return (
    <section className="card p-5 sm:p-6" aria-label={title}>
      <h2 className="font-semibold text-ink">{title}</h2>
      {shown.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{empty}</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead className="sr-only">
            <tr>
              <th scope="col">Item</th>
              <th scope="col">{unit}</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.key} className="align-top">
                <th scope="row" className="py-2 pr-3 text-left font-normal text-ink">
                  <span className="block">{r.label}</span>
                  <span aria-hidden="true" className="mt-1.5 block h-2 rounded-r-[4px] bg-accent-strong" style={{ width: `${Math.max(2, (r.count / max) * 100)}%` }} />
                </th>
                <td className="w-16 py-2 text-right font-semibold tabular-nums text-ink">{formatNumber(r.count)}</td>
                <td className="w-14 py-2 text-right tabular-nums text-muted">{total > 0 ? `${Math.round((r.count / total) * 100)}%` : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {rows.length > limit ? <p className="mt-2 text-xs text-muted">Top {limit} of {rows.length}. The CSV export has all of them.</p> : null}
    </section>
  );
}

/** Headline number with the change against the previous period. */
export function StatTile({ label, value, previous, format = formatNumber, hint }: { label: string; value: number; previous: number; format?: (n: number) => string; hint?: string }) {
  let delta: { text: string; up: boolean | null };
  if (previous === 0) delta = { text: value === 0 ? "No change" : "New this period", up: null };
  else {
    const pct = Math.round(((value - previous) / previous) * 100);
    delta = pct === 0 ? { text: "No change", up: null } : { text: `${pct > 0 ? "+" : "−"}${Math.abs(pct)}% vs previous period`, up: pct > 0 };
  }
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-sm font-semibold text-ink-soft">{label}</p>
      <p className="mt-1 font-sans text-3xl font-semibold text-ink sm:text-4xl">{format(value)}</p>
      <p className={`mt-1 flex items-center gap-1 text-sm ${delta.up === null ? "text-muted" : delta.up ? "text-accent-deep" : "text-rose-deep"}`}>
        {delta.up !== null ? (
          <svg aria-hidden="true" viewBox="0 0 12 12" className={`h-3 w-3 ${delta.up ? "" : "rotate-180"}`}>
            <path d="M6 2 10.5 8h-9Z" fill="currentColor" />
          </svg>
        ) : null}
        {delta.text}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
