import { announcementSchema, lenientList, siteSettingsSchema, testimonialSchema } from "@/cms/schemas";
import { paragraphs, pick } from "@/cms/localize";

const announcement = {
  id: "a1",
  kind: "closure",
  title: { en: "Closed today", es: null },
  startsAt: "2026-10-01T12:00:00Z",
};

describe("CMS schemas", () => {
  it("normalises optional announcement fields", () => {
    const a = announcementSchema.parse(announcement);
    expect(a).toMatchObject({ body: null, endsAt: null, banner: true, link: null });
    expect(a.title.es).toBeNull();
  });

  it.each(["javascript:alert(1)", "//evil.example", "data:text/html,x"])("rejects unsafe link %s", (href) => {
    expect(announcementSchema.safeParse({ ...announcement, link: { label: { en: "x" }, href } }).success).toBe(false);
  });

  it.each(["/families", "https://example.org", "tel:+18707933200", "mailto:a@b.co"])("accepts link %s", (href) => {
    expect(announcementSchema.safeParse({ ...announcement, link: { label: { en: "x" }, href } }).success).toBe(true);
  });

  it("rejects unknown kinds and oversized text", () => {
    expect(announcementSchema.safeParse({ ...announcement, kind: "party" }).success).toBe(false);
    expect(announcementSchema.safeParse({ ...announcement, title: { en: "x".repeat(141) } }).success).toBe(false);
  });

  it("refuses testimonials without consent on file", () => {
    const t = { id: "t", quote: { en: "Great" }, attribution: { en: "Ana" } };
    expect(testimonialSchema.safeParse({ ...t, consentOnFile: false }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...t, consentOnFile: true }).success).toBe(true);
  });

  it("drops invalid list items individually", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const list = lenientList(announcementSchema).parse([announcement, { id: "bad" }]);
    expect(list).toHaveLength(1);
    warn.mockRestore();
  });

  it("validates contact settings", () => {
    expect(siteSettingsSchema.parse(null)).toBeNull();
    expect(siteSettingsSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(siteSettingsSchema.parse({ fax: "870-555-0100" })).toEqual({
      fax: "870-555-0100",
      email: null,
      southCampus: null,
      enrollmentFormEn: null,
      enrollmentFormEs: null,
      referralUploadUrl: null,
      directAddress: null,
      textAlerts: null,
    });
  });
});

describe("localize", () => {
  it("uses Spanish when present and marks English fallbacks", () => {
    expect(pick({ en: "Hi", es: "Hola" }, "es")).toEqual({ text: "Hola" });
    expect(pick({ en: "Hi", es: null }, "es")).toEqual({ text: "Hi", lang: "en-US" });
    expect(pick({ en: "Hi", es: "Hola" }, "en")).toEqual({ text: "Hi" });
  });

  it("splits paragraphs on blank lines", () => {
    expect(paragraphs("One.\n\nTwo.\n  \nThree.")).toEqual(["One.", "Two.", "Three."]);
  });
});
