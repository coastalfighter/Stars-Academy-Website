/**
 * Every page of the previous STARS website (Wix), mapped to its new home.
 *
 * Source: the old site's own sitemap (www.mystarsacademy.org/pages-sitemap.xml)
 * and a crawl of its navigation, October 2026: 14 pages. Paths that still
 * exist unchanged (/, /about-us, /contact-us, /schedule-a-tour) need no
 * redirect. Permanent (308) redirects pass search ranking to the new pages
 * and keep links in physician offices, directories and old posts working.
 *
 * Keep entries here forever: removing one breaks links someone printed.
 */
export type LegacyRedirect = {
  /** Path on the old site. */
  from: string;
  /** New path (must be a real page; see tests/launch). */
  to: string;
  /** What the old page was, for the people reviewing this list. */
  was: string;
};

export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  { from: "/speech-therapy", to: "/services/speech-therapy", was: "Speech Therapy" },
  { from: "/occupational-therapy", to: "/services/occupational-therapy", was: "Occupational Therapy" },
  { from: "/physical-therapy", to: "/services/physical-therapy", was: "Physical Therapy" },
  { from: "/nursing", to: "/services/nursing-care", was: "Nursing & LPN" },
  { from: "/classrooms", to: "/services/developmental-classrooms", was: "Classrooms" },
  { from: "/what-we-do", to: "/services", was: "What We Do (menu of the five services)" },
  { from: "/enroll-now", to: "/enroll", was: "Enroll Now (eligibility, Medicaid, enrollment packet)" },
  { from: "/apply-now", to: "/careers/apply", was: "Apply Now! (employment application)" },
  { from: "/general-8", to: "/careers", was: "Career Opportunities" },
  { from: "/walk", to: "/resources", was: "Instructional Videos (under construction)" },
];

/** Old pages that kept their address on the new site. */
export const LEGACY_UNCHANGED: readonly string[] = ["/", "/about-us", "/contact-us", "/schedule-a-tour"];

/** In the shape next.config.ts `redirects()` expects. Query strings are carried over. */
export const nextRedirects = () => LEGACY_REDIRECTS.map((r) => ({ source: r.from, destination: r.to, permanent: true }));
