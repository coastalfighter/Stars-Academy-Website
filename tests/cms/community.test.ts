import { getEvents, getGalleryPhotos, getResources, getTeam, isUpcoming } from "@/cms/repository";
import { eventSchema, galleryPhotoSchema, resourceSchema, teamMemberSchema } from "@/cms/schemas";

const NOW = new Date("2026-10-01T15:00:00Z");
const iso = (h: number) => new Date(NOW.getTime() + h * 3600e3).toISOString();
const IMG = { url: "https://cdn.sanity.io/images/abc123/production/a1b2c3-1200x800.jpg", width: 1200, height: 800, lqip: null };

function serve(fixtures: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const type = new URL(input).searchParams.get("query")?.match(/_type == "(\w+)"/)?.[1] ?? "";
      return new Response(JSON.stringify({ result: fixtures[type] ?? null }), { status: 200 });
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("SANITY_PROJECT_ID", "abc123");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const event = (over: Record<string, unknown> = {}) => ({
  id: "e1",
  slug: "open-house",
  title: { en: "Open house", es: "Puertas abiertas" },
  startsAt: iso(48),
  audience: "families",
  location: "main",
  ...over,
});

describe("CMS validation for new content", () => {
  it("rejects unsafe or inconsistent events", () => {
    expect(eventSchema.safeParse(event()).success).toBe(true);
    expect(eventSchema.safeParse(event({ slug: "Not A Slug" })).success).toBe(false);
    expect(eventSchema.safeParse(event({ endsAt: iso(47) })).success).toBe(false);
    expect(eventSchema.safeParse(event({ registration: { kind: "link", href: "http://insecure.example" } })).success).toBe(false);
    expect(eventSchema.safeParse(event({ registration: { kind: "link", href: "javascript:alert(1)" } })).success).toBe(false);
  });

  it("only accepts resources with an https link, a site path or a Sanity PDF", () => {
    const base = { id: "r", title: { en: "T" }, summary: { en: "S" }, topic: "community" };
    expect(resourceSchema.safeParse({ ...base, link: { en: "https://example.org" } }).success).toBe(true);
    expect(resourceSchema.safeParse({ ...base, link: { en: "/faq" } }).success).toBe(true);
    expect(resourceSchema.safeParse({ ...base, file: { es: "https://cdn.sanity.io/files/abc123/production/x9.pdf" } }).success).toBe(true);
    expect(resourceSchema.safeParse({ ...base, link: { en: "http://example.org" } }).success).toBe(false);
    expect(resourceSchema.safeParse({ ...base, link: { en: "//evil.example" } }).success).toBe(false);
    expect(resourceSchema.safeParse({ ...base, file: { en: "https://evil.example/files/x.pdf" } }).success).toBe(false);
    expect(resourceSchema.safeParse(base).success).toBe(false);
  });

  it("never accepts a gallery photo without consent, or images from other hosts", () => {
    const photo = { id: "g", image: IMG, alt: { en: "Kids playing" }, topic: "classrooms", consentOnFile: true };
    expect(galleryPhotoSchema.safeParse(photo).success).toBe(true);
    expect(galleryPhotoSchema.safeParse({ ...photo, consentOnFile: false }).success).toBe(false);
    expect(galleryPhotoSchema.safeParse({ ...photo, consentOnFile: undefined }).success).toBe(false);
    expect(galleryPhotoSchema.safeParse({ ...photo, image: { ...IMG, url: "https://evil.example/images/a.jpg" } }).success).toBe(false);
    expect(galleryPhotoSchema.safeParse({ ...photo, image: { ...IMG, lqip: "javascript:alert(1)" } }).success).toBe(false);
    expect(galleryPhotoSchema.safeParse({ ...photo, alt: { en: "" } }).success).toBe(false);
  });

  it("treats older team entries as leadership without a photo", () => {
    expect(teamMemberSchema.parse({ id: "t", name: "A Person", role: { en: "Director" } })).toMatchObject({ group: "leadership", speaksSpanish: false, photo: null });
  });
});

describe("events", () => {
  it("lists upcoming events soonest first, localized, dropping past and invalid ones", async () => {
    serve({
      event: [
        event({ id: "later", slug: "later", startsAt: iso(100) }),
        event({ id: "soon", slug: "soon", startsAt: iso(2), title: { en: "Soon", es: null } }),
        event({ id: "running", slug: "running", startsAt: iso(-1), endsAt: iso(1) }),
        event({ id: "over", slug: "over", startsAt: iso(-10), endsAt: iso(-8) }),
        event({ id: "bad", slug: "Bad!" }),
      ],
    });
    const list = await getEvents("es", NOW);
    expect(list.map((e) => e.id)).toEqual(["running", "soon", "later"]);
    expect(list[1]?.title).toEqual({ text: "Soon", lang: "en-US" });
  });

  it("keeps events without an end time for a few hours, all-day events for the day", () => {
    expect(isUpcoming({ startsAt: iso(-2), endsAt: null, allDay: false }, NOW)).toBe(true);
    expect(isUpcoming({ startsAt: iso(-4), endsAt: null, allDay: false }, NOW)).toBe(false);
    expect(isUpcoming({ startsAt: iso(-20), endsAt: null, allDay: true }, NOW)).toBe(true);
  });

  it("is empty without a CMS", async () => {
    vi.unstubAllEnvs();
    expect(await getEvents("en", NOW)).toEqual([]);
  });
});

describe("resources", () => {
  it("falls back to the bundled library, resolving site pages per language", async () => {
    vi.unstubAllEnvs();
    const es = await getResources("es");
    const enrollment = es.find((r) => r.id === "stars-getting-started");
    expect(enrollment).toMatchObject({ href: "/es/como-empezar", kind: "page", materialLang: null });
    expect(es.find((r) => r.id === "arkansas-211")).toMatchObject({ kind: "external", materialLang: "en-US" });
    expect(es.find((r) => r.id === "aap-healthychildren")?.href).toContain("/Spanish/");
  });

  it("prefers a file in the visitor's language, then a link, then the other language", async () => {
    serve({
      resource: [
        { id: "a", title: { en: "A" }, summary: { en: "a" }, topic: "at-home", file: { en: "https://cdn.sanity.io/files/abc123/production/en1.pdf", es: "https://cdn.sanity.io/files/abc123/production/es1.pdf" } },
        { id: "b", title: { en: "B" }, summary: { en: "b" }, topic: "development", link: { en: "https://example.org/b" } },
        { id: "unsafe", title: { en: "U" }, summary: { en: "u" }, topic: "community", link: { en: "javascript:alert(1)" } },
      ],
    });
    const es = await getResources("es");
    expect(es.map((r) => r.id)).toEqual(["a", "b"]);
    expect(es[0]).toMatchObject({ href: "https://cdn.sanity.io/files/abc123/production/es1.pdf", kind: "pdf", materialLang: null });
    expect(es[1]).toMatchObject({ href: "https://example.org/b", kind: "external", materialLang: "en-US" });
  });
});

describe("gallery and team", () => {
  it("shows bundled photography until consented CMS photos exist", async () => {
    vi.unstubAllEnvs();
    const bundled = await getGalleryPhotos("es");
    expect(bundled.length).toBeGreaterThan(0);
    expect(bundled[0]?.src).toMatch(/^\/photos\//);

    vi.stubEnv("SANITY_PROJECT_ID", "abc123");
    serve({
      galleryPhoto: [
        { id: "ok", image: IMG, alt: { en: "Blocks", es: "Bloques" }, topic: "classrooms", consentOnFile: true },
        { id: "no", image: IMG, alt: { en: "No consent" }, topic: "classrooms", consentOnFile: false },
      ],
    });
    const photos = await getGalleryPhotos("es");
    expect(photos.map((p) => p.id)).toEqual(["ok"]);
    expect(photos[0]?.alt).toEqual({ text: "Bloques" });
  });

  it("returns staff with their team and photo", async () => {
    serve({ teamMember: [{ id: "t", name: "Rosa", role: { en: "SLP" }, group: "therapy", speaksSpanish: true, photo: IMG }] });
    expect(await getTeam("en")).toEqual([
      expect.objectContaining({ id: "t", group: "therapy", speaksSpanish: true, photo: expect.objectContaining({ url: IMG.url }) }),
    ]);
  });
});
