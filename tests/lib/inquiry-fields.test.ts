import { inquirySchema, toFieldErrors } from "@/lib/validation/inquiry";
import { renderEmail, toPayload } from "@/lib/inquiry/deliver";

const base = {
  audience: "family",
  reason: "eligibility",
  name: "Jordan Parker",
  phone: "870-555-0134",
  preferredContact: "phone",
  consent: true,
};

describe("enrollment fields", () => {
  it("accepts an optional child age band and doctor answer", () => {
    const r = inquirySchema.parse({ ...base, childAge: "2", hasPrimaryDoctor: "not-sure" });
    expect(r.childAge).toBe("2");
    expect(r.hasPrimaryDoctor).toBe("not-sure");
  });

  it("defaults unanswered optional selects to empty", () => {
    const r = inquirySchema.parse(base);
    expect(r.childAge).toBe("");
    expect(r.position).toBe("");
  });

  it("rejects values outside the allowed bands", () => {
    expect(inquirySchema.safeParse({ ...base, childAge: "9" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...base, hasPrimaryDoctor: "maybe" }).success).toBe(false);
  });

  it("requires a phone number when text is the preferred contact", () => {
    const r = inquirySchema.safeParse({ ...base, phone: "", email: "a@b.co", preferredContact: "text" });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).phone).toBeDefined();
  });
});

describe("job application fields", () => {
  const job = { ...base, audience: "job-seeker", reason: "careers" };

  it("requires a position for job seekers", () => {
    const r = inquirySchema.safeParse(job);
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).position).toMatch(/role/i);
    expect(inquirySchema.safeParse({ ...job, position: "ecdt" }).success).toBe(true);
  });

  it("validates the optional start date", () => {
    expect(inquirySchema.safeParse({ ...job, position: "clinical", startDate: "2026-11-02" }).success).toBe(true);
    expect(inquirySchema.safeParse({ ...job, position: "clinical", startDate: "next week" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...job, position: "clinical", startDate: "2026-13-45" }).success).toBe(false);
  });
});

describe("delivery rendering", () => {
  it("includes human-readable labels for the new fields", () => {
    const inquiry = inquirySchema.parse({
      ...base,
      audience: "job-seeker",
      reason: "careers",
      position: "van-driver",
      startDate: "2026-11-02",
      preferredContact: "text",
    });
    const { text } = renderEmail(toPayload(inquiry, new Date("2026-10-01T12:00:00Z")));
    expect(text).toContain("Position: Van Driver");
    expect(text).toContain("Earliest start date: 2026-11-02");
    expect(text).toContain("Preferred contact: Text message");
    expect(text).not.toContain("Child’s age");
  });
});
