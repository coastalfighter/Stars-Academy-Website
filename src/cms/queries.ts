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

export const TEAM_QUERY = /* groq */ `
*[_type == "teamMember"] | order(order asc, name asc){
  "id": _id,
  name,
  credentials,
  role,
  bio
}`;

export const SITE_SETTINGS_QUERY = /* groq */ `
*[_type == "siteSettings" && _id == "siteSettings"][0]{
  fax,
  email,
  "southCampus": select(defined(southCampus.street) => southCampus{ street, city, region, postalCode, note }, null)
}`;
