import { z } from "zod";

/**
 * Shared (client + server) validation for the tour / inquiry / referral form.
 *
 * HIPAA note: this website form is a *contact* channel only. It must never
 * collect protected health information (PHI). The schema therefore has no
 * fields for a child's name, date of birth, diagnosis or insurance IDs, and
 * `detectPhi` rejects free text that looks like it contains them.
 */

export const AUDIENCES = ["family", "current-family", "physician", "school", "job-seeker", "other"] as const;
export const REASONS = ["tour", "eligibility", "referral", "current-family", "careers", "question"] as const;
export const CONTACT_METHODS = ["phone", "text", "email"] as const;
export const LANGUAGES = ["en", "es"] as const;
/** Child's age band — an age alone is not an identifier, and it helps triage enrollment. */
export const CHILD_AGES = ["under-1", "1", "2", "3", "4", "5", "6"] as const;
export const DOCTOR_ANSWERS = ["yes", "no", "not-sure"] as const;
export const POSITIONS = ["ecds", "ecdt", "van-rider", "van-driver", "clinical", "not-sure"] as const;

export type Audience = (typeof AUDIENCES)[number];
export type Reason = (typeof REASONS)[number];

export const AUDIENCE_LABELS: Record<Audience, string> = {
  family: "Parent or caregiver",
  "current-family": "Current STARS family",
  physician: "Physician, NP/PA or clinic staff",
  school: "School, district or early intervention",
  "job-seeker": "Therapist, nurse, educator or job seeker",
  other: "Someone else",
};

export const REASON_LABELS: Record<Reason, string> = {
  tour: "Schedule a tour",
  eligibility: "See if STARS is right for a child",
  referral: "Refer a patient or student",
  "current-family": "A question about my child’s day at STARS",
  careers: "Working at STARS",
  question: "Something else",
};

export const CONTACT_LABELS: Record<(typeof CONTACT_METHODS)[number], string> = {
  phone: "Phone call",
  text: "Text message",
  email: "Email",
};

export const CHILD_AGE_LABELS: Record<(typeof CHILD_AGES)[number], string> = {
  "under-1": "Under 12 months",
  "1": "1 year",
  "2": "2 years",
  "3": "3 years",
  "4": "4 years",
  "5": "5 years",
  "6": "6 years",
};

export const DOCTOR_LABELS: Record<(typeof DOCTOR_ANSWERS)[number], string> = {
  yes: "Yes",
  no: "No",
  "not-sure": "Not sure",
};

export const POSITION_LABELS: Record<(typeof POSITIONS)[number], string> = {
  ecds: "Early Childhood Developmental Specialist",
  ecdt: "Early Childhood Developmental Technician",
  "van-rider": "Van Rider",
  "van-driver": "Van Driver",
  clinical: "Therapists & Nurses",
  "not-sure": "Not sure yet — tell me about openings",
};

/** Optional enum: accepts "" (not answered) or one of the values. */
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.literal(""), z.enum(values)]).optional().default("");

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

/** Minimum time a human needs to fill the form; faster submissions are bots. */
export const MIN_FILL_MS = 2500;

const PHI_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\b(d\.?o\.?b\.?|date of birth|birth ?date|born on)\b/i, reason: "a date of birth" },
  { pattern: /\b\d{1,2}[/.-]\d{1,2}[/.-](\d{4}|\d{2})\b/, reason: "a date" },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/, reason: "a Social Security number" },
  {
    pattern: /\b(medicaid|member|policy|subscriber|insurance|mrn|ssn|patient)\s*(id|#|number|no\.?)?\s*[:#-]?\s*[a-z]{0,3}\d{5,}/i,
    reason: "an insurance, member or record number",
  },
];

/** Returns a human-readable reason if the text looks like it contains PHI. */
export function detectPhi(text: string): string | null {
  for (const { pattern, reason } of PHI_PATTERNS) {
    if (pattern.test(text)) return reason;
  }
  return null;
}

const phoneRegex = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const trimmed = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters.`);

export const inquirySchema = z
  .object({
    audience: z.enum(AUDIENCES, { message: "Please tell us who you are." }),
    reason: z.enum(REASONS, { message: "Please choose how we can help." }),
    name: trimmed(100).min(2, "Please enter your name."),
    organization: trimmed(150).optional().default(""),
    email: z
      .string()
      .trim()
      .max(254)
      .optional()
      .default("")
      .refine((v) => v === "" || z.email().safeParse(v).success, "Please enter a valid email address."),
    phone: z
      .string()
      .trim()
      .max(25)
      .optional()
      .default("")
      .refine((v) => v === "" || phoneRegex.test(v), "Please enter a 10-digit U.S. phone number."),
    preferredContact: z.enum(CONTACT_METHODS).default("phone"),
    language: z.enum(LANGUAGES).default("en"),
    childAge: optionalEnum(CHILD_AGES),
    hasPrimaryDoctor: optionalEnum(DOCTOR_ANSWERS),
    position: optionalEnum(POSITIONS),
    startDate: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((v) => v === "" || (isoDate.test(v) && !Number.isNaN(Date.parse(v))), "Please enter a valid date."),
    message: trimmed(1000).optional().default(""),
    consent: z.literal(true, { message: "Please confirm you have not included medical information." }),
    /** Honeypot — real visitors never see or fill this field. */
    website: z.string().max(0).optional().default(""),
    /** Epoch ms when the form was rendered; used for the minimum fill time. */
    startedAt: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Please share a phone number or email so we can reach you." });
    }
    if (data.preferredContact === "email" && !data.email) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Add an email address, or choose phone as your preferred contact." });
    }
    if ((data.preferredContact === "phone" || data.preferredContact === "text") && !data.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a phone number, or choose email as your preferred contact." });
    }
    if (data.reason === "careers" && data.audience === "job-seeker" && !data.position) {
      ctx.addIssue({ code: "custom", path: ["position"], message: "Please choose the role you’re interested in." });
    }
    if ((data.audience === "physician" || data.audience === "school") && !data.organization) {
      ctx.addIssue({ code: "custom", path: ["organization"], message: "Please enter your practice, school or organization." });
    }
    const phi = detectPhi(`${data.message} ${data.organization}`);
    if (phi) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: `It looks like this includes ${phi}. Please remove medical or identifying details — we’ll collect those through a secure channel.`,
      });
    }
  });

export type InquiryInput = z.input<typeof inquirySchema>;
export type Inquiry = z.output<typeof inquirySchema>;

export type FieldErrors = Partial<Record<keyof Inquiry, string>>;

/** Flattens zod issues into one message per field (first issue wins). */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key as keyof Inquiry] = issue.message;
    }
  }
  return out;
}
