import { z } from "zod";

/**
 * Shared (client + server) validation for the tour / inquiry / referral form.
 *
 * HIPAA note: this website form is a *contact* channel only. It must never
 * collect protected health information (PHI). The schema therefore has no
 * fields for a child's name, date of birth, diagnosis or insurance IDs, and
 * `detectPhi` rejects free text that looks like it contains them.
 */

export const AUDIENCES = ["family", "physician", "school", "job-seeker", "other"] as const;
export const REASONS = ["tour", "eligibility", "referral", "question", "careers"] as const;
export const CONTACT_METHODS = ["phone", "email"] as const;
export const LANGUAGES = ["en", "es"] as const;

export const AUDIENCE_LABELS: Record<(typeof AUDIENCES)[number], string> = {
  family: "Parent or caregiver",
  physician: "Physician, NP/PA or clinic staff",
  school: "School, district or early intervention",
  "job-seeker": "Therapist, nurse or educator",
  other: "Someone else",
};

export const REASON_LABELS: Record<(typeof REASONS)[number], string> = {
  tour: "Schedule a tour",
  eligibility: "See if STARS is right for a child",
  referral: "Refer a patient or student",
  question: "Ask a question",
  careers: "Ask about working at STARS",
};

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
    if (data.preferredContact === "phone" && !data.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a phone number, or choose email as your preferred contact." });
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
