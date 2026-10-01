import { getAnnouncements, getFaqs, getJobOpenings, getSiteSettings, getTeam, getTestimonials, isActive, dayStart } from "@/cms/repository";
import { faqs as bundledFaqs } from "@/content/faq";

const NOW = new Date("2026-10-01T15:00:00Z");
const hour = 3600e3;
const iso = (offsetHours: number) => new Date(NOW.getTime() + offsetHours * hour).toISOString();

function serve(fixtures: Record<string, unknown>) {
  const fetchMock = vi.fn(async (input: string) => {
    const type = new URL(input).searchParams.get("query")?.match(/_type == "(\w+)"/)?.[1] ?? "";
    return new Response(JSON.stringify({ result: fixtures[type] ?? null }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("CMS repositories", () => {
  beforeEach(() => {
    vi.stubEnv("SANITY_PROJECT_ID", "abc123");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns only active announcements, most important first, localized", async () => {
    serve({
      announcement: [
        { id: "info", kind: "info", title: { en: "Info", es: "Novedad" }, startsAt: iso(-5) },
        { id: "closure", kind: "closure", title: { en: "Closed", es: null }, startsAt: iso(-1), endsAt: iso(5) },
        { id: "expired", kind: "urgent", title: { en: "Old" }, startsAt: iso(-10), endsAt: iso(-2) },
        { id: "future", kind: "urgent", title: { en: "Later" }, startsAt: iso(3) },
      ],
    });
    const list = await getAnnouncements("es", NOW);
    expect(list.map((a) => a.id)).toEqual(["closure", "info"]);
    expect(list[0]?.title).toEqual({ text: "Closed", lang: "en-US" });
    expect(list[1]?.title).toEqual({ text: "Novedad" });
  });

  it("keeps the announcements query URL stable within a day (cacheable)", async () => {
    const fetchMock = serve({ announcement: [] });
    await getAnnouncements("en", new Date("2026-10-01T01:00:00Z"));
    await getAnnouncements("en", new Date("2026-10-01T23:00:00Z"));
    const [a, b] = fetchMock.mock.calls.map((c) => c[0]);
    expect(a).toBe(b);
    expect(dayStart(NOW)).toBe("2026-10-01T00:00:00.000Z");
  });

  it("treats endsAt as exclusive and startsAt as inclusive", () => {
    expect(isActive({ startsAt: iso(0), endsAt: null }, NOW)).toBe(true);
    expect(isActive({ startsAt: iso(-1), endsAt: iso(0) }, NOW)).toBe(false);
  });

  it("uses CMS FAQs when present, splitting paragraphs and marking fallbacks", async () => {
    serve({ faq: [{ key: "weather", group: "current", question: { en: "Weather?", es: null }, answer: { en: "A.\n\nB.", es: null } }] });
    const faqs = await getFaqs("es");
    expect(faqs).toEqual([{ id: "weather", group: "current", question: "Weather?", answer: ["A.", "B."], lang: "en-US" }]);
  });

  it("falls back to bundled FAQs when the CMS has none or is off", async () => {
    serve({ faq: [] });
    expect(await getFaqs("en")).toEqual(bundledFaqs);
    vi.unstubAllEnvs();
    expect(await getFaqs("en")).toEqual(bundledFaqs);
  });

  it("falls back to bundled openings, and maps CMS openings", async () => {
    serve({ jobOpening: null });
    expect((await getJobOpenings()).map((j) => j.position)).toContain("ecds");
    serve({ jobOpening: [{ key: "j1", team: "Therapy", title: "SLP", body: "Join us.", requirements: [], position: null }] });
    expect(await getJobOpenings()).toEqual([{ id: "j1", team: "Therapy", title: "SLP", body: "Join us.", requirements: [], position: null }]);
  });

  it("returns nothing for testimonials, team and settings without CMS data", async () => {
    vi.unstubAllEnvs();
    expect(await getTestimonials("en")).toEqual([]);
    expect(await getTeam("en")).toEqual([]);
    expect(await getSiteSettings("en")).toEqual({ fax: null, email: null, southCampus: null });
  });

  it("localizes team members and settings", async () => {
    serve({
      teamMember: [{ id: "m", name: "Jane", credentials: null, role: { en: "Director", es: "Directora" }, bio: null }],
      siteSettings: { fax: "1", email: null, southCampus: { street: "1 Main", city: "Batesville", region: "AR", postalCode: "72501", note: { en: "Infants", es: "Bebés" } } },
    });
    expect((await getTeam("es"))[0]?.role).toEqual({ text: "Directora" });
    expect((await getSiteSettings("es")).southCampus?.note).toEqual({ text: "Bebés" });
  });
});
