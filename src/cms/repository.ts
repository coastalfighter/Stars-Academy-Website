import type { Locale } from "@/i18n/config";
import { getContent } from "@/content";
import type { Faq } from "@/content/faq";
import { openRoles } from "@/content/pages";
import type { POSITIONS } from "@/lib/validation/inquiry";
import { cmsQuery } from "./client";
import { cmsConfig, CMS_TAGS, REVALIDATE_SECONDS } from "./config";
import { paragraphs, pick, type LocalizedText } from "./localize";
import { href as routeHref } from "@/i18n/routes";
import { bundledResources } from "@/content/resources";
import { HTML_LANG } from "@/i18n/config";
import {
  ANNOUNCEMENTS_QUERY,
  EVENTS_QUERY,
  GALLERY_QUERY,
  RESOURCES_QUERY,
  FAQS_QUERY,
  JOB_OPENINGS_QUERY,
  SITE_SETTINGS_QUERY,
  TEAM_QUERY,
  TESTIMONIALS_QUERY,
} from "./queries";
import {
  announcementSchema,
  eventSchema,
  galleryPhotoSchema,
  resourceSchema,
  type CmsEvent,
  type CmsImage,
  type GALLERY_TOPICS,
  type ResourceTopic,
  type TeamGroup,
  faqSchema,
  jobOpeningSchema,
  lenientList,
  siteSettingsSchema,
  teamMemberSchema,
  testimonialSchema,
  type CmsAnnouncement,
} from "./schemas";

/**
 * Content the clinic's staff manage in the CMS. Every function resolves to
 * bundled defaults when the CMS is off or failing, so pages always render.
 */

export const cmsEnabled = (): boolean => cmsConfig() !== null;

const opts = (tag: string, revalidate: number = REVALIDATE_SECONDS.default) => ({ tags: [tag], revalidate });

/* ── Announcements ───────────────────────────────────────── */

export type AnnouncementKind = CmsAnnouncement["kind"];

export type Announcement = {
  id: string;
  kind: AnnouncementKind;
  title: LocalizedText;
  body: LocalizedText | null;
  link: { label: LocalizedText; href: string } | null;
  startsAt: string;
  endsAt: string | null;
  banner: boolean;
};

const KIND_PRIORITY: Record<AnnouncementKind, number> = { urgent: 0, closure: 1, event: 2, info: 3 };

export const isActive = (a: Pick<CmsAnnouncement, "startsAt" | "endsAt">, now: Date): boolean =>
  Date.parse(a.startsAt) <= now.getTime() && (a.endsAt === null || Date.parse(a.endsAt) > now.getTime());

/** Start of the UTC day — keeps the query URL (and its cache entry) stable all day. */
export const dayStart = (now: Date): string =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();

export function localizeAnnouncement(a: CmsAnnouncement, locale: Locale): Announcement {
  return {
    id: a.id,
    kind: a.kind,
    title: pick(a.title, locale),
    body: a.body ? pick(a.body, locale) : null,
    link: a.link ? { label: pick(a.link.label, locale), href: a.link.href } : null,
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    banner: a.banner,
  };
}

/** Active announcements, most important first. None are bundled: empty without a CMS. */
export async function getAnnouncements(locale: Locale, now: Date = new Date()): Promise<Announcement[]> {
  const raw = await cmsQuery(
    ANNOUNCEMENTS_QUERY,
    { since: dayStart(now) },
    lenientList(announcementSchema),
    opts(CMS_TAGS.announcement, REVALIDATE_SECONDS.announcement),
  );
  return (raw ?? [])
    .filter((a) => isActive(a, now))
    .sort((a, b) => KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind] || Date.parse(b.startsAt) - Date.parse(a.startsAt))
    .map((a) => localizeAnnouncement(a, locale));
}

/* ── FAQs ────────────────────────────────────────────────── */

/** CMS FAQs replace the bundled set once staff have entered any. */
export async function getFaqs(locale: Locale): Promise<Faq[]> {
  const raw = await cmsQuery(FAQS_QUERY, {}, lenientList(faqSchema), opts(CMS_TAGS.faq));
  if (!raw || raw.length === 0) return getContent(locale).faqs;
  return raw.map((f) => {
    const question = pick(f.question, locale);
    const answer = pick(f.answer, locale);
    return {
      id: f.key,
      group: f.group,
      question: question.text,
      answer: paragraphs(answer.text),
      lang: question.lang ?? answer.lang,
    };
  });
}

export const faqsInGroup = (faqs: readonly Faq[], group: Faq["group"]) => faqs.filter((f) => f.group === group);
export const faqsByKeys = (faqs: readonly Faq[], keys: readonly string[]) =>
  keys.map((k) => faqs.find((f) => f.id === k)).filter((f): f is Faq => Boolean(f));

/* ── Job openings (careers is English-only) ──────────────── */

export type JobOpening = {
  id: string;
  team: string;
  title: string;
  body: string;
  requirements: string[];
  position: (typeof POSITIONS)[number] | null;
};

const bundledOpenings: JobOpening[] = openRoles.map((r) => ({
  id: r.id,
  team: r.team,
  title: r.title,
  body: r.body,
  requirements: [...r.requirements],
  position: r.id,
}));

export async function getJobOpenings(): Promise<JobOpening[]> {
  const raw = await cmsQuery(JOB_OPENINGS_QUERY, {}, lenientList(jobOpeningSchema), opts(CMS_TAGS.jobOpening));
  if (!raw || raw.length === 0) return bundledOpenings;
  return raw.map((j) => ({ id: j.key, team: j.team, title: j.title, body: j.body, requirements: j.requirements, position: j.position }));
}

/* ── Testimonials ────────────────────────────────────────── */

export type Testimonial = { id: string; quote: LocalizedText; attribution: LocalizedText };

/** Only testimonials with written consent on file. None are bundled. */
export async function getTestimonials(locale: Locale): Promise<Testimonial[]> {
  const raw = await cmsQuery(TESTIMONIALS_QUERY, {}, lenientList(testimonialSchema), opts(CMS_TAGS.testimonial));
  return (raw ?? []).map((t) => ({ id: t.id, quote: pick(t.quote, locale), attribution: pick(t.attribution, locale) }));
}

/* ── Team ────────────────────────────────────────────────── */

export type TeamMember = {
  id: string;
  name: string;
  credentials: string | null;
  role: LocalizedText;
  bio: LocalizedText | null;
  group: TeamGroup;
  speaksSpanish: boolean;
  photo: CmsImage | null;
};

/** Everyone staff have published, in editor order. None are bundled. */
export async function getTeam(locale: Locale): Promise<TeamMember[]> {
  const raw = await cmsQuery(TEAM_QUERY, {}, lenientList(teamMemberSchema), opts(CMS_TAGS.teamMember));
  return (raw ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    credentials: m.credentials,
    role: pick(m.role, locale),
    bio: m.bio ? pick(m.bio, locale) : null,
    group: m.group,
    speaksSpanish: m.speaksSpanish,
    photo: m.photo,
  }));
}

/* ── Events ──────────────────────────────────────────────── */

export type StarsEvent = Omit<CmsEvent, "title" | "summary" | "locationDetail"> & {
  title: LocalizedText;
  summary: LocalizedText | null;
  locationDetail: LocalizedText | null;
};

/** An event is upcoming until it ends (or, without an end time, until its start day is over). */
export function isUpcoming(e: Pick<CmsEvent, "startsAt" | "endsAt" | "allDay">, now: Date): boolean {
  const end = e.endsAt ? Date.parse(e.endsAt) : Date.parse(e.startsAt) + (e.allDay ? 24 : 3) * 3600_000;
  return end > now.getTime();
}

/** Upcoming events, soonest first. None are bundled: the page shows an empty state without a CMS. */
export async function getEvents(locale: Locale, now: Date = new Date()): Promise<StarsEvent[]> {
  const raw = await cmsQuery(EVENTS_QUERY, { since: dayStart(now) }, lenientList(eventSchema), opts(CMS_TAGS.event, REVALIDATE_SECONDS.announcement));
  return (raw ?? [])
    .filter((e) => isUpcoming(e, now))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .map((e) => ({
      ...e,
      title: pick(e.title, locale),
      summary: e.summary ? pick(e.summary, locale) : null,
      locationDetail: e.locationDetail ? pick(e.locationDetail, locale) : null,
    }));
}

/* ── Resources ───────────────────────────────────────────── */

export type Resource = {
  id: string;
  topic: ResourceTopic;
  title: LocalizedText;
  summary: LocalizedText;
  publisher: string | null;
  href: string;
  kind: "page" | "pdf" | "external";
  /** Set when the linked material is in another language than the page. */
  materialLang: string | null;
};

type Variants = { en: string | null; es: string | null };

/** Picks the visitor's language of a link or file, falling back to the other. */
function pickVariant(variants: Variants, locale: Locale): { href: string; lang: string | null } | null {
  const other: Locale = locale === "en" ? "es" : "en";
  const mine = variants[locale];
  if (mine) return { href: mine, lang: null };
  const theirs = variants[other];
  return theirs ? { href: theirs, lang: HTML_LANG[other] } : null;
}

const kindOf = (href: string, isFile: boolean): Resource["kind"] => (isFile ? "pdf" : href.startsWith("/") ? "page" : "external");

function bundledLibrary(locale: Locale): Resource[] {
  return bundledResources.flatMap((r) => {
    const target = "route" in r.target ? { href: routeHref(locale, r.target.route), lang: null } : pickVariant(r.target, locale);
    if (!target) return [];
    return [
      {
        id: r.id,
        topic: r.topic,
        title: { text: r.title[locale] },
        summary: { text: r.summary[locale] },
        publisher: r.publisher,
        href: target.href,
        kind: kindOf(target.href, false),
        materialLang: target.lang,
      },
    ];
  });
}

/** CMS resources replace the bundled library once staff have added any. */
export async function getResources(locale: Locale): Promise<Resource[]> {
  const raw = await cmsQuery(RESOURCES_QUERY, {}, lenientList(resourceSchema), opts(CMS_TAGS.resource));
  if (!raw || raw.length === 0) return bundledLibrary(locale);
  return raw.flatMap((r) => {
    // A file in the visitor's language beats a link in it; then fall back across languages.
    const file = r.file[locale] ? { href: r.file[locale]!, lang: null } : null;
    const link = r.link[locale] ? { href: r.link[locale]!, lang: null } : null;
    const chosen = file ?? link ?? pickVariant(r.file, locale) ?? pickVariant(r.link, locale);
    if (!chosen) return [];
    const isFile = chosen.href.startsWith("https://cdn.sanity.io/files/");
    return [
      {
        id: r.id,
        topic: r.topic,
        title: pick(r.title, locale),
        summary: pick(r.summary, locale),
        publisher: r.publisher,
        href: chosen.href,
        kind: kindOf(chosen.href, isFile),
        materialLang: chosen.lang,
      },
    ];
  });
}

/* ── Photo gallery ───────────────────────────────────────── */

export type GalleryPhoto = {
  id: string;
  src: string;
  width: number;
  height: number;
  blurDataURL: string | null;
  alt: LocalizedText;
  caption: LocalizedText | null;
  topic: CmsGalleryTopic;
};
type CmsGalleryTopic = (typeof GALLERY_TOPICS)[number];

const BUNDLED_TOPICS: Record<string, CmsGalleryTopic> = {
  storyTime: "classrooms",
  ballPit: "classrooms",
  classroomPlay: "classrooms",
  floorGame: "classrooms",
  parentChildWalk: "outdoors",
};

/** CMS photos (consent on file only) replace the bundled photography once any are published. */
export async function getGalleryPhotos(locale: Locale): Promise<GalleryPhoto[]> {
  const raw = await cmsQuery(GALLERY_QUERY, {}, lenientList(galleryPhotoSchema), opts(CMS_TAGS.galleryPhoto));
  if (!raw || raw.length === 0) {
    return Object.entries(getContent(locale).photos).map(([key, p]) => ({
      id: `bundled-${key}`,
      src: p.src,
      width: p.width,
      height: p.height,
      blurDataURL: null,
      alt: { text: p.alt },
      caption: null,
      topic: BUNDLED_TOPICS[key] ?? "classrooms",
    }));
  }
  return raw.map((p) => ({
    id: p.id,
    src: p.image.url,
    width: p.image.width,
    height: p.image.height,
    blurDataURL: p.image.lqip,
    alt: pick(p.alt, locale),
    caption: p.caption ? pick(p.caption, locale) : null,
    topic: p.topic,
  }));
}

/* ── Contact extras ──────────────────────────────────────── */

export type SiteSettings = {
  fax: string | null;
  email: string | null;
  southCampus: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    note: LocalizedText | null;
  } | null;
};

const EMPTY_SETTINGS: SiteSettings = { fax: null, email: null, southCampus: null };

export async function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  const raw = await cmsQuery(SITE_SETTINGS_QUERY, {}, siteSettingsSchema, opts(CMS_TAGS.siteSettings));
  if (!raw) return EMPTY_SETTINGS;
  return {
    fax: raw.fax,
    email: raw.email,
    southCampus: raw.southCampus
      ? { ...raw.southCampus, note: raw.southCampus.note ? pick(raw.southCampus.note, locale) : null }
      : null,
  };
}
