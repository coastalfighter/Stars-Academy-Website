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

/** Images hosted by Sanity's CDN. Served to visitors through Next's optimizer (same origin). */
export const SANITY_IMAGE_URL = /^https:\/\/cdn\.sanity\.io\/images\/[a-z0-9]+\/[\w-]+\/[\w-]+\.(jpe?g|png|webp|gif|avif)$/;
/** PDFs uploaded to Sanity. Linked directly as downloads. */
export const SANITY_FILE_URL = /^https:\/\/cdn\.sanity\.io\/files\/[a-z0-9]+\/[\w-]+\/[\w-]+\.pdf$/;

export const cmsImageSchema = z.object({
  url: z.string().regex(SANITY_IMAGE_URL),
  width: z.number().int().min(16).max(12000),
  height: z.number().int().min(16).max(12000),
  /** Tiny blurred placeholder Sanity generates; only data: URIs are accepted. */
  lqip: z
    .string()
    .max(3000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
    .nullish()
    .transform((v) => v ?? null),
});
export type CmsImage = z.infer<typeof cmsImageSchema>;

export const TEAM_GROUPS = ["leadership", "therapy", "nursing", "education", "support"] as const;
export type TeamGroup = (typeof TEAM_GROUPS)[number];

export const teamMemberSchema = z.object({
  id: text(120),
  name: text(100),
  credentials: optionalText(100),
  role: localized(120),
  bio: localized(800).nullish().transform((v) => v ?? null),
  group: z.enum(TEAM_GROUPS).nullish().transform((v) => v ?? "leadership"),
  /** Languages the person works in, beyond English (e.g. Spanish-speaking therapists). */
  speaksSpanish: z.boolean().nullish().transform((v) => v ?? false),
  // The query only returns a photo when the staff member agreed to it being published.
  photo: cmsImageSchema.nullish().transform((v) => v ?? null),
});

export const EVENT_AUDIENCES = ["families", "community", "professionals", "jobs"] as const;

export const eventSchema = z
  .object({
    id: text(120),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(96),
    title: localized(140),
    summary: localized(600).nullish().transform((v) => v ?? null),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }).nullish().transform((v) => v ?? null),
    allDay: z.boolean().nullish().transform((v) => v ?? false),
    audience: z.enum(EVENT_AUDIENCES),
    location: z.enum(["main", "south", "online", "other"]),
    locationDetail: localized(200).nullish().transform((v) => v ?? null),
    registration: z
      .object({ kind: z.enum(["none", "call", "link"]), href: safeHref.nullish().transform((v) => v ?? null) })
      .nullish()
      .transform((v) => v ?? { kind: "none" as const, href: null }),
    spanishAvailable: z.boolean().nullish().transform((v) => v ?? false),
  })
  .refine((e) => e.endsAt === null || Date.parse(e.endsAt) > Date.parse(e.startsAt), "An event must end after it starts")
  .refine((e) => e.registration.kind !== "link" || Boolean(e.registration.href?.startsWith("https://")), "Registration links must use https");
export type CmsEvent = z.infer<typeof eventSchema>;

export const RESOURCE_TOPICS = ["getting-started", "development", "at-home", "insurance", "community"] as const;
export type ResourceTopic = (typeof RESOURCE_TOPICS)[number];

const httpsOrSitePath = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^(https:\/\/|\/(?!\/))/.test(v), "Resources link to https pages or site paths");

export const resourceSchema = z
  .object({
    id: text(120),
    title: localized(140),
    summary: localized(400),
    topic: z.enum(RESOURCE_TOPICS),
    publisher: optionalText(80),
    /** A link per language; the Spanish one is optional. */
    link: z
      .object({ en: httpsOrSitePath.nullish().transform((v) => v ?? null), es: httpsOrSitePath.nullish().transform((v) => v ?? null) })
      .nullish()
      .transform((v) => v ?? { en: null, es: null }),
    file: z
      .object({
        en: z.string().regex(SANITY_FILE_URL).nullish().transform((v) => v ?? null),
        es: z.string().regex(SANITY_FILE_URL).nullish().transform((v) => v ?? null),
      })
      .nullish()
      .transform((v) => v ?? { en: null, es: null }),
  })
  .refine((r) => Boolean(r.link.en || r.link.es || r.file.en || r.file.es), "A resource needs a link or a file");
export type CmsResource = z.infer<typeof resourceSchema>;

export const GALLERY_TOPICS = ["classrooms", "therapy", "outdoors", "events", "campus"] as const;

export const galleryPhotoSchema = z.object({
  id: text(120),
  image: cmsImageSchema,
  alt: localized(250),
  caption: localized(200).nullish().transform((v) => v ?? null),
  topic: z.enum(GALLERY_TOPICS),
  // Defence in depth: the query filters on this, and Studio blocks publishing without it.
  consentOnFile: z.literal(true),
});
export type CmsGalleryPhoto = z.infer<typeof galleryPhotoSchema>;

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
