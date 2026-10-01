/**
 * The analytics beacon protocol, shared by the browser tracker and the
 * collector. Dependency-free: the tracker ships on every page.
 *
 * Privacy model (see the privacy notice and docs/ANALYTICS.md):
 * - No cookies, no browser storage for tracking, no IP addresses, no visitor
 *   or session IDs, no fingerprinting. Nothing links one page view to another.
 * - The server only increments daily aggregate counters; no event is stored.
 * - Global Privacy Control, Do Not Track and the visitor's opt-out are honoured
 *   in the browser, and GPC/DNT again on the server.
 */

export const COLLECT_PATH = "/api/collect";
/** localStorage key set by the opt-out switch on the privacy page. */
export const OPT_OUT_KEY = "stars:analytics-optout";

/** Interactions worth counting, and the only details each may carry. */
export const EVENTS = {
  phone_click: [],
  email_click: [],
  directions_click: [],
  form_start: [],
  language_switch: ["en", "es"],
  calm_mode: ["on", "off"],
  /** The enrollment check finished, with its (anonymous) outcome. */
  eligibility_check: ["fit", "talk", "age"],
  /** Someone opened a secure form that collects health information. */
  secure_form: ["enrollment", "referral"],
} as const satisfies Record<string, readonly string[]>;

export type EventName = keyof typeof EVENTS;

export type PageviewBeacon = {
  k: "pv";
  /** Pathname only (no query string or fragment). */
  p: string;
  /** Viewport width in CSS px, for a mobile / tablet / desktop split. */
  w: number;
  /** 1 when this view starts a visit (arrived from another site, or typed in). */
  e: 0 | 1;
  /** Referring site's hostname, on entry only. */
  r?: string;
  /** Campaign tags from the landing URL, on entry only. */
  us?: string;
  um?: string;
  uc?: string;
};

export type EventBeacon = { k: "ev"; p: string; n: EventName; d?: string };

export type Beacon = PageviewBeacon | EventBeacon;
