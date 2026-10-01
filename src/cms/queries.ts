/**
 * GROQ queries. Projections reshape documents into exactly what the site
 * needs; field names here are the contract with studio/schemaTypes.
 */

/**
 * `$since` is rounded to the day by the caller so the request URL — and so the
 * cache entry — stays stable; precise start/end times are applied at render.
 */
export const ANNOUNCEMENTS_QUERY = /* groq */ `
*[_type == "announcement" && (!defined(endsAt) || endsAt > $since)]
  | order(startsAt desc)[0...20]{
    "id": _id,
    kind,
    title,
    body,
    startsAt,
    endsAt,
    "banner": showBanner,
    "link": select(defined(link.href) => { "label": link.label, "href": link.href }, null)
  }`;

export const FAQS_QUERY = /* groq */ `
*[_type == "faq"] | order(group asc, order asc, _createdAt asc){
  "key": key.current,
  group,
  question,
  answer
}`;

export const JOB_OPENINGS_QUERY = /* groq */ `
*[_type == "jobOpening" && open == true] | order(order asc, _createdAt asc){
  "key": _id,
  team,
  title,
  body,
  "requirements": coalesce(requirements, []),
  position
}`;

export const TESTIMONIALS_QUERY = /* groq */ `
*[_type == "testimonial" && consentOnFile == true] | order(order asc, _createdAt desc)[0...6]{
  "id": _id,
  quote,
  attribution,
  consentOnFile
}`;

/** Shared image projection: CDN URL, size and blur placeholder. */
const IMAGE = /* groq */ `{ "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, "lqip": asset->metadata.lqip }`;

/**
 * Staff. A photo is only returned when the staff member agreed to it being
 * published; older entries without a group count as leadership.
 */
export const TEAM_QUERY = /* groq */ `
*[_type == "teamMember"] | order(order asc, name asc){
  "id": _id,
  name,
  credentials,
  role,
  bio,
  "group": coalesce(group, "leadership"),
  speaksSpanish,
  "photo": select(photoConsent == true && defined(photo.asset) => photo${IMAGE}, null)
}`;

/** `$since` (start of today, UTC) keeps the request URL stable; exact times are applied at render. */
export const EVENTS_QUERY = /* groq */ `
*[_type == "event" && coalesce(endsAt, startsAt) > $since] | order(startsAt asc)[0...40]{
  "id": _id,
  "slug": slug.current,
  title,
  summary,
  startsAt,
  endsAt,
  allDay,
  audience,
  location,
  locationDetail,
  "registration": { "kind": coalesce(registration.kind, "none"), "href": registration.href },
  spanishAvailable
}`;

export const RESOURCES_QUERY = /* groq */ `
*[_type == "resource"] | order(topic asc, order asc, _createdAt asc)[0...120]{
  "id": _id,
  title,
  summary,
  topic,
  publisher,
  "link": { "en": link.en, "es": link.es },
  "file": { "en": fileEn.asset->url, "es": fileEs.asset->url }
}`;

/** Only photos with consent on file — the site validates this again. */
export const GALLERY_QUERY = /* groq */ `
*[_type == "galleryPhoto" && consentOnFile == true && defined(image.asset)] | order(order asc, _createdAt desc)[0...60]{
  "id": _id,
  "image": image${IMAGE},
  alt,
  caption,
  topic,
  consentOnFile
}`;

export const SITE_SETTINGS_QUERY = /* groq */ `
*[_type == "siteSettings" && _id == "siteSettings"][0]{
  fax,
  email,
  "southCampus": select(defined(southCampus.street) => southCampus{ street, city, region, postalCode, note }, null)
}`;
