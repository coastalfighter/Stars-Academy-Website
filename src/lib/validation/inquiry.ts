import { z } from "zod";
import type { Locale } from "@/i18n/config";
import { validationMessage, type ValidationCode } from "@/i18n/messages";

// Zod's JIT compiles parsers with `new Function`, which the site's CSP
// (no 'unsafe-eval') rightly blocks. Interpreted parsing is plenty fast for
// a single form and keeps the browser console free of CSP violations.
z.config({ jitless: true });

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

export type PhiKind = "dob" | "date" | "ssn" | "memberId";

/** English and Spanish phrasings; the site serves families in both languages. */
const PHI_PATTERNS: { pattern: RegExp; kind: PhiKind }[] = [
  {
    pattern: /\b(d\.?o\.?b\.?|date of birth|birth ?date|born on|fecha de nacimiento|naci[oó] el|nacida el|nacido el)\b/i,
    kind: "dob",
  },
  { pattern: /\b\d{1,2}[/.-]\d{1,2}[/.-](\d{4}|\d{2})\b/, kind: "date" },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/, kind: "ssn" },
  { pattern: /\bseguro social\s*[:#-]?\s*\d/i, kind: "ssn" },
  {
    pattern:
      /\b(medicaid|member|policy|subscriber|insurance|mrn|ssn|patient|afiliado|miembro|p[oó]liza|seguro|expediente|paciente)\s*(id|#|number|no\.?|n[uú]mero( de)?)?\s*[:#-]?\s*[a-z]{0,3}\d{5,}/i,
    kind: "memberId",
  },
];

/** Returns which kind of PHI the text appears to contain, if any. */
export function detectPhi(text: string): PhiKind | null {
  for (const { pattern, kind } of PHI_PATTERNS) {
    if (pattern.test(text)) return kind;
  }
  return null;
}

const phoneRegex = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const trimmed = (max: number) => z.string().trim().max(max, "tooLong" satisfies ValidationCode);

/**
 * Issue messages are *codes* (see i18n/messages.ts), translated for display by
 * `toFieldErrors(error, locale)`. That keeps one schema for both languages and
 * for both the browser and the API.
 */
const code = (c: ValidationCode) => c;

export const inquirySchema = z
  .object({
    audience: z.enum(AUDIENCES, { message: code("audience.required") }),
    reason: z.enum(REASONS, { message: code("reason.required") }),
    name: trimmed(100).min(2, code("name.required")),
    organization: trimmed(150).optional().default(""),
    email: z
      .string()
      .trim()
      .max(254, code("tooLong"))
      .optional()
      .default("")
      .refine((v) => v === "" || z.email().safeParse(v).success, code("email.invalid")),
    phone: z
      .string()
      .trim()
      .max(25, code("tooLong"))
      .optional()
      .default("")
      .refine((v) => v === "" || phoneRegex.test(v), code("phone.invalid")),
    preferredContact: z.enum(CONTACT_METHODS).default("phone"),
    language: z.enum(LANGUAGES).default("en"),
    /** Language of the page the form was sent from (used for response messages). */
    locale: z.enum(LANGUAGES).default("en"),
    childAge: optionalEnum(CHILD_AGES),
    hasPrimaryDoctor: optionalEnum(DOCTOR_ANSWERS),
    position: optionalEnum(POSITIONS),
    startDate: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((v) => v === "" || (isoDate.test(v) && !Number.isNaN(Date.parse(v))), code("date.invalid")),
    message: trimmed(1000).optional().default(""),
    consent: z.literal(true, { message: code("consent.required") }),
    /** Honeypot — real visitors never see or fill this field. */
    website: z.string().max(0).optional().default(""),
    /** Epoch ms when the form was rendered; used for the minimum fill time. */
    startedAt: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const issue = (path: string, c: ValidationCode) => ctx.addIssue({ code: "custom", path: [path], message: c });
    if (!data.email && !data.phone) issue("phone", "contact.required");
    if (data.preferredContact === "email" && !data.email) issue("email", "email.requiredForPreference");
    if ((data.preferredContact === "phone" || data.preferredContact === "text") && !data.phone) {
      issue("phone", "phone.requiredForPreference");
    }
    if (data.reason === "careers" && data.audience === "job-seeker" && !data.position) issue("position", "position.required");
    if ((data.audience === "physician" || data.audience === "school") && !data.organization) {
      issue("organization", "organization.required");
    }
    const phi = detectPhi(`${data.message} ${data.organization}`);
    if (phi) issue("message", `phi.${phi}`);
  });

export type InquiryInput = z.input<typeof inquirySchema>;
export type Inquiry = z.output<typeof inquirySchema>;

export type FieldErrors = Partial<Record<keyof Inquiry, string>>;

/** Flattens zod issues into one translated message per field (first issue wins). */
export function toFieldErrors(error: z.ZodError, locale: Locale = "en"): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key as keyof Inquiry] = validationMessage(issue.message, locale);
    }
  }
  return out;
}
