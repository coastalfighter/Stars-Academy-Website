import { buildReport, reportCsv } from "@/lib/analytics/report";
import { loadReport, parseRange } from "@/lib/analytics/load";
import { MemoryAnalyticsStore, type DayData } from "@/lib/analytics/store";
import { niceMax } from "@/components/insights/charts";

const day = (d: string, counts: Partial<DayData["counts"]>): DayData => ({ day: d, counts: { pv: {}, entry: {}, camp: {}, dev: {}, ev: {}, inq: {}, ...counts } });

const current = [
  day("2026-09-30", {
    pv: { "home|en": 10, "faq|es": 4 },
    entry: { "search|google.com|en": 5, "direct|-|en": 3 },
    ev: { "phone_click|-|contact|en": 2, "language_switch|es|home|en": 1 },
    inq: { "tour|family|early-intervention|es": 1 },
    dev: { mobile: 9, desktop: 5 },
  }),
  day("2026-10-01", { pv: { "home|en": 6 }, entry: { "campaign|flyer|en": 2 }, camp: { "fall-open-house|flyer": 2 }, inq: { "referral|physician|doctor|en": 1 } }),
];
const previous = [day("2026-09-28", { entry: { "direct|-|en": 5 } }), day("2026-09-29", {})];

describe("buildReport", () => {
  const r = buildReport(current, previous);

  it("totals the period and the one before", () => {
    expect(r).toMatchObject({ from: "2026-09-30", to: "2026-10-01", days: 2 });
    expect(r.totals).toMatchObject({ visits: 10, pageviews: 20, inquiries: 2, inquiryRate: 20, phone: 2 });
    expect(r.previous.visits).toBe(5);
    expect(r.daily).toEqual([
      { day: "2026-09-30", visits: 8, pageviews: 14, inquiries: 1 },
      { day: "2026-10-01", visits: 2, pageviews: 6, inquiries: 1 },
    ]);
  });

  it("ranks breakdowns with human labels", () => {
    expect(r.pages[0]).toEqual({ key: "home", label: "Home", count: 16 });
    expect(r.channels.map((c) => c.key)).toEqual(["search", "direct", "campaign"]);
    expect(r.sources.map((s) => s.label)).toEqual(["google.com", "flyer"]);
    expect(r.heardFrom.map((h) => h.label).sort()).toEqual(["First Connections or early intervention", "Our doctor or clinic"]);
    expect(r.languages).toEqual([
      { key: "en", label: "English", count: 16 },
      { key: "es", label: "Spanish", count: 4 },
    ]);
    expect(r.interactions.find((i) => i.key === "language_switch|es")?.label).toBe("Switched to Spanish");
    expect(r.campaigns[0]?.label).toBe("fall-open-house (flyer)");
  });

  it("exports CSV that spreadsheets can't execute", () => {
    const evil = buildReport([day("d", { entry: { "referral|=cmd()|en": 1 } })], []);
    const csv = reportCsv(evil);
    expect(csv.startsWith("section,item,value\r\n")).toBe(true);
    expect(csv).toContain("visits by source,'=cmd(),1");
    expect(reportCsv(r)).toContain('visits by channel,"Direct (typed, bookmarks, apps)",3');
  });
});

describe("loading a range", () => {
  it("reads the range and the same span before it", async () => {
    const store = new MemoryAnalyticsStore();
    await store.record("2026-10-01", [{ metric: "entry", field: "direct|-|en" }]);
    await store.record("2026-09-24", [{ metric: "entry", field: "direct|-|en" }, { metric: "entry", field: "direct|-|en" }]);
    const report = await loadReport(7, { store, now: Date.UTC(2026, 9, 1, 18) });
    expect(report).toMatchObject({ from: "2026-09-25", to: "2026-10-01" });
    expect(report.totals.visits).toBe(1);
    expect(report.previous.visits).toBe(2);
  });

  it("accepts only the offered ranges", () => {
    expect(parseRange("7")).toBe(7);
    expect(parseRange(["90"])).toBe(90);
    expect(parseRange("365")).toBe(30);
    expect(parseRange(undefined)).toBe(30);
  });

  it("picks clean axis maxima", () => {
    expect([0, 3, 7, 13, 22, 25, 61, 130, 950].map(niceMax)).toEqual([4, 4, 8, 20, 40, 40, 80, 200, 1000]);
  });
});
