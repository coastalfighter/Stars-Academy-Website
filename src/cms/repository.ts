import type { Locale } from "@/i18n/config";
import { getContent } from "@/content";
import type { Faq } from "@/content/faq";
import { openRoles } from "@/content/pages";
import type { POSITIONS } from "@/lib/validation/inquiry";
import { cmsQuery } from "./client";
import { cmsConfig, CMS_TAGS, REVALIDATE_SECONDS } from "./config";
import { paragraphs, pick, type LocalizedText } from "./localize";
import {
  ANNOUNCEMENTS_QUERY,
  FAQS_QUERY,
  JOB_OPENINGS_QUERY,
  SITE_SETTINGS_QUERY,
  TEAM_QUERY,
  TESTIMONIALS_QUERY,
} from "./queries";
import {
  announcementSchema,
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

/* ── Leadership ──────────────────────────────────────────── */

export type TeamMember = {
  id: string;
  name: string;
  credentials: string | null;
  role: LocalizedText;
  bio: LocalizedText | null;
};

export async function getTeam(locale: Locale): Promise<TeamMember[]> {
  const raw = await cmsQuery(TEAM_QUERY, {}, lenientList(teamMemberSchema), opts(CMS_TAGS.teamMember));
  return (raw ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    credentials: m.credentials,
    role: pick(m.role, locale),
    bio: m.bio ? pick(m.bio, locale) : null,
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
