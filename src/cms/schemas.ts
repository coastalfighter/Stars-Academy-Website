import { z } from "zod";
import { POSITIONS } from "@/lib/validation/inquiry";

/**
 * Validation for data coming back from the CMS. CMS content is treated as
 * untrusted input: strings are bounded, URLs restricted to http(s)/tel/mailto
 * or site-relative paths, and enums checked, before anything reaches a page.
 */

const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

/** A field translated per language. English is required; Spanish may lag. */
export const localized = (max: number) => z.object({ en: text(max), es: optionalText(max) });
export type Localized = z.infer<ReturnType<typeof localized>>;

const safeHref = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^(https?:\/\/|tel:|mailto:|\/(?!\/))/i.test(v), "Only http(s), tel:, mailto: or site-relative links");

export const announcementSchema = z.object({
  id: text(120),
  kind: z.enum(["info", "event", "closure", "urgent"]),
  title: localized(140),
  body: localized(600).nullish().transform((v) => v ?? null),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }).nullish().transform((v) => v ?? null),
  banner: z.boolean().nullish().transform((v) => v ?? true),
  link: z
    .object({ label: localized(60), href: safeHref })
    .nullish()
    .transform((v) => v ?? null),
});
export type CmsAnnouncement = z.infer<typeof announcementSchema>;

export const faqSchema = z.object({
  key: text(80),
  group: z.enum(["families", "current", "partners", "jobs"]),
  question: localized(200),
  answer: localized(2000),
});

export const jobOpeningSchema = z.object({
  key: text(80),
  team: text(60),
  title: text(120),
  body: text(800),
  requirements: z.array(text(200)).max(10),
  position: z.enum(POSITIONS).nullish().transform((v) => v ?? null),
});

export const testimonialSchema = z.object({
  id: text(120),
  quote: localized(600),
  attribution: localized(120),
  // Defence in depth: the query filters on this too, and Studio blocks publishing without it.
  consentOnFile: z.literal(true),
});

export const teamMemberSchema = z.object({
  id: text(120),
  name: text(100),
  credentials: optionalText(100),
  role: localized(120),
  bio: localized(800).nullish().transform((v) => v ?? null),
});

export const siteSettingsSchema = z
  .object({
    fax: optionalText(30),
    email: z.email().max(254).nullish().transform((v) => v ?? null),
    southCampus: z
      .object({
        street: text(120),
        city: text(60),
        region: text(10),
        postalCode: text(12),
        note: localized(200).nullish().transform((v) => v ?? null),
      })
      .nullish()
      .transform((v) => v ?? null),
  })
  .nullable();

/** Lists drop invalid items individually instead of failing the whole list. */
export const lenientList = <T extends z.ZodType>(item: T) =>
  z
    .array(z.unknown())
    .max(200)
    .transform((items) =>
      items.flatMap((i) => {
        const r = item.safeParse(i);
        if (!r.success) console.warn("[cms] skipped an invalid item", r.error.issues.slice(0, 2));
        return r.success ? [r.data as z.output<T>] : [];
      }),
    );
