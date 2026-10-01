/**
 * Sanity configuration, read from server-side environment variables only.
 *
 * The CMS is optional: with no project configured, every repository returns
 * the content bundled in src/content, so the site always renders.
 */

export type CmsConfig = {
  projectId: string;
  dataset: string;
  apiVersion: string;
  /** Read token (viewer role) — only needed for draft previews. */
  readToken: string | null;
  webhookSecret: string | null;
  studioUrl: string | null;
};

// These values are interpolated into a hostname and path, so they are strictly
// validated to rule out request redirection through misconfiguration.
const PROJECT_ID = /^[a-z0-9]{4,32}$/;
const DATASET = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const API_VERSION = /^\d{4}-\d{2}-\d{2}$/;

export const DEFAULT_API_VERSION = "2025-02-19";

export function cmsConfig(env: NodeJS.ProcessEnv = process.env): CmsConfig | null {
  const projectId = env.SANITY_PROJECT_ID?.trim();
  if (!projectId) return null;
  if (!PROJECT_ID.test(projectId)) {
    console.warn("[cms] SANITY_PROJECT_ID is malformed; using bundled content.");
    return null;
  }
  const dataset = env.SANITY_DATASET?.trim() || "production";
  if (!DATASET.test(dataset)) {
    console.warn("[cms] SANITY_DATASET is malformed; using bundled content.");
    return null;
  }
  const apiVersion = env.SANITY_API_VERSION?.trim() || DEFAULT_API_VERSION;
  return {
    projectId,
    dataset,
    apiVersion: API_VERSION.test(apiVersion) ? apiVersion : DEFAULT_API_VERSION,
    readToken: env.SANITY_READ_TOKEN?.trim() || null,
    webhookSecret: env.SANITY_WEBHOOK_SECRET?.trim() || null,
    studioUrl: env.SANITY_STUDIO_URL?.trim() || null,
  };
}

/** Cache tags, one per document type, so a publish only refreshes what it touched. */
export const CMS_TAGS = {
  announcement: "cms:announcement",
  faq: "cms:faq",
  jobOpening: "cms:jobOpening",
  testimonial: "cms:testimonial",
  teamMember: "cms:teamMember",
  event: "cms:event",
  resource: "cms:resource",
  galleryPhoto: "cms:galleryPhoto",
  siteSettings: "cms:siteSettings",
} as const;

export type CmsDocumentType = keyof typeof CMS_TAGS;

export const isCmsDocumentType = (value: unknown): value is CmsDocumentType =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(CMS_TAGS, value);

/**
 * Upper bound on staleness if a webhook is ever missed. Announcements use a
 * short window so scheduled start/end times take effect within minutes.
 */
export const REVALIDATE_SECONDS = { default: 3600, announcement: 300 } as const;
