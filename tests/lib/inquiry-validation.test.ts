import { detectPhi, inquirySchema, toFieldErrors } from "@/lib/validation/inquiry";

const valid = {
  audience: "family",
  reason: "tour",
  name: "Jordan Parker",
  phone: "870-555-0134",
  email: "",
  preferredContact: "phone",
  message: "Mornings are best.",
  consent: true,
};

describe("inquirySchema", () => {
  it("accepts a valid family inquiry and applies defaults", () => {
    const r = inquirySchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.language).toBe("en");
      expect(r.data.organization).toBe("");
    }
  });

  it("trims whitespace", () => {
    const r = inquirySchema.parse({ ...valid, name: "  Sam Lee  " });
    expect(r.name).toBe("Sam Lee");
  });

  it("requires a phone or email", () => {
    const r = inquirySchema.safeParse({ ...valid, phone: "", email: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).phone).toMatch(/phone number or email/i);
  });

  it("requires the preferred contact method to be filled", () => {
    const r = inquirySchema.safeParse({ ...valid, preferredContact: "email" });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).email).toBeDefined();
  });

  it("validates email and phone formats", () => {
    expect(inquirySchema.safeParse({ ...valid, email: "not-an-email", preferredContact: "phone" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, phone: "(870) 793-3200" }).success).toBe(true);
    expect(inquirySchema.safeParse({ ...valid, phone: "+1 870.793.3200" }).success).toBe(true);
  });

  it("requires an organization for physicians and schools", () => {
    const r = inquirySchema.safeParse({ ...valid, audience: "physician", reason: "referral" });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).organization).toBeDefined();
    expect(
      inquirySchema.safeParse({ ...valid, audience: "physician", reason: "referral", organization: "White River Pediatrics" }).success,
    ).toBe(true);
  });

  it("requires explicit consent", () => {
    expect(inquirySchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });

  it("rejects unknown enum values", () => {
    expect(inquirySchema.safeParse({ ...valid, audience: "admin" }).success).toBe(false);
  });

  it("rejects messages containing likely PHI", () => {
    const r = inquirySchema.safeParse({ ...valid, message: "My son, DOB 04/12/2021, has autism" });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).message).toMatch(/medical or identifying/i);
  });

  it("enforces length limits", () => {
    expect(inquirySchema.safeParse({ ...valid, message: "a".repeat(1001) }).success).toBe(false);
  });
});

describe("detectPhi", () => {
  it.each([
    ["Date of birth is in May", "dob"],
    ["born on 3-4-2022", "dob"],
    ["seen on 12/01/2024", "date"],
    ["SSN 123-45-6789", "ssn"],
    ["Medicaid ID 1234567890", "memberId"],
    ["member #AB123456", "memberId"],
    ["Su fecha de nacimiento es en mayo", "dob"],
    ["Mi hija nació el martes", "dob"],
    ["Seguro Social 123456789", "ssn"],
    ["número de Medicaid 1234567890", "memberId"],
    ["póliza 98765432", "memberId"],
  ])("flags %s", (text, kind) => {
    expect(detectPhi(text)).toBe(kind);
  });

  it.each([
    "Please call after 2pm",
    "We live in Batesville",
    "Can we visit on Tuesday?",
    "Call me at 870-555-0134",
    "Por favor llámeme después de las 2",
    "Mi hijo tiene 3 años y no habla mucho",
    "Llámeme al 870-555-0134",
  ])(
    "allows %s",
    (text) => {
      expect(detectPhi(text)).toBeNull();
    },
  );
});
