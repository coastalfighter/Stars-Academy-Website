import Link from "next/link";
import type { Report } from "@/lib/analytics/report";
import type { RangeDays } from "@/lib/analytics/load";
import { RANGES } from "@/lib/analytics/load";
import { buttonClass } from "@/components/ui/Button";
import { StarMark } from "@/components/ui/StarMark";
import { BarTable, ColumnChart, StatTile } from "./charts";

const longDay = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

export function InsightsDashboard({
  report,
  range,
  storage,
  enabled,
}: {
  report: Report;
  range: RangeDays;
  storage: "shared" | "memory";
  enabled: boolean;
}) {
  const t = report.totals;
  const p = report.previous;
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <StarMark className="h-10 w-10" />
          <div>
            <h1 className="font-display text-3xl">Website insights</h1>
            <p className="text-sm text-ink-soft">
              {longDay(report.from)} – {longDay(report.to)} · anonymous totals, Central Time
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Date range" className="flex rounded-full border border-line bg-paper p-1">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/admin/insights?range=${r}`}
                aria-current={r === range ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-semibold ${r === range ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"}`}
              >
                {r} days
              </Link>
            ))}
          </nav>
          <a href={`/api/insights/export?range=${range}`} className={buttonClass("ghost", "md")}>
            Download CSV
          </a>
          <form method="post" action="/api/insights/logout">
            <button type="submit" className={buttonClass("ghost", "md")}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      {!enabled ? (
        <p role="status" className="mt-6 rounded-2xl bg-lilac/10 p-4 text-sm">
          Analytics is switched off (ANALYTICS_ENABLED=false). No new visits are being counted.
        </p>
      ) : storage === "memory" ? (
        <p role="status" className="mt-6 rounded-2xl bg-ice/70 p-4 text-sm">
          Counts are kept in this server’s memory only, so they reset on each deployment and may be partial on serverless hosting. Connect Upstash Redis (see docs/OPERATIONS.md) to keep them.
        </p>
      ) : null}

      <section aria-label="Headline numbers" className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Visits" value={t.visits} previous={p.visits} hint="Arrivals from outside the site" />
        <StatTile label="Page views" value={t.pageviews} previous={p.pageviews} />
        <StatTile label="Inquiries sent" value={t.inquiries} previous={p.inquiries} hint="Delivered website forms" />
        <StatTile label="Inquiries per 100 visits" value={t.inquiryRate} previous={p.inquiryRate} format={(n) => n.toFixed(1)} />
        <StatTile label="Phone taps" value={t.phone} previous={p.phone} />
        <StatTile label="Directions opened" value={t.directions} previous={p.directions} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ColumnChart title="Visits per day" unit="visits" unitOne="visit" data={report.daily.map((d) => ({ day: d.day, value: d.visits }))} />
        <ColumnChart title="Inquiries per day" unit="inquiries" unitOne="inquiry" data={report.daily.map((d) => ({ day: d.day, value: d.inquiries }))} />
      </div>

      <h2 className="mt-12 font-display text-2xl">How families find STARS</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <BarTable title="How they heard about STARS (from inquiries)" rows={report.heardFrom} unit="Inquiries" />
        <BarTable title="How visitors arrived" rows={report.channels} unit="Visits" />
        <BarTable title="Referring sites and campaign sources" rows={report.sources} unit="Visits" />
      </div>

      <h2 className="mt-12 font-display text-2xl">Inquiries</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <BarTable title="What people asked for" rows={report.inquiryReasons} unit="Inquiries" />
        <BarTable title="Who sent them" rows={report.inquiryAudiences} unit="Inquiries" />
        <BarTable title="Language of the form" rows={report.inquiryLanguages} unit="Inquiries" />
      </div>

      <h2 className="mt-12 font-display text-2xl">Pages and visitors</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <BarTable title="Most viewed pages" rows={report.pages} unit="Page views" limit={12} />
        <BarTable title="Interactions" rows={report.interactions} unit="Times" />
        <div className="grid gap-4">
          <BarTable title="Devices" rows={report.devices} unit="Page views" />
          <BarTable title="Page language" rows={report.languages} unit="Page views" />
        </div>
      </div>

      {report.campaigns.length > 0 ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <BarTable title="Campaigns (utm_campaign)" rows={report.campaigns} unit="Visits" />
        </div>
      ) : null}

      <p className="mt-12 max-w-3xl text-sm text-muted">
        How this is counted: each page view adds one to a daily total. There are no cookies, IP addresses or visitor IDs, so one person
        visiting twice counts as two visits, and nobody’s path through the site can be followed. Browsers that send Global Privacy Control or
        Do Not Track, visitors who opted out on the privacy page, and bots are not counted, so real traffic is somewhat higher. Inquiries are
        counted when a form is delivered.
      </p>
    </div>
  );
}
