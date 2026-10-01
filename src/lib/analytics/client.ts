import { COLLECT_PATH, EVENTS, OPT_OUT_KEY, type Beacon, type EventName } from "./protocol";

/**
 * Browser side of the site analytics. Tiny and dependency-free.
 *
 * Sends nothing unless <Analytics /> has mounted (the server switches it on),
 * and never when the visitor has opted out, sends Global Privacy Control or
 * Do Not Track, or the browser is automated.
 */

let enabled = false;
let firstView = true;

export function setAnalyticsEnabled(on: boolean): void {
  enabled = on;
}

type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };

export function isOptedOut(): boolean {
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === "true";
  } catch {
    return false;
  }
}

export function setOptedOut(out: boolean): void {
  try {
    if (out) window.localStorage.setItem(OPT_OUT_KEY, "true");
    else window.localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    // Storage blocked: GPC/DNT remain the reliable signals.
  }
}

/** Signals the browser itself sends on the visitor's behalf. */
export function browserSignalsOptOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as PrivacyNavigator;
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1" || nav.msDoNotTrack === "1";
}

export function trackingAllowed(): boolean {
  if (!enabled || typeof window === "undefined") return false;
  if (navigator.webdriver) return false;
  return !browserSignalsOptOut() && !isOptedOut();
}

function send(beacon: Beacon): void {
  try {
    const body = JSON.stringify(beacon);
    // text/plain keeps sendBeacon a "simple" request (no CORS preflight).
    if (typeof navigator.sendBeacon === "function" && navigator.sendBeacon(COLLECT_PATH, new Blob([body], { type: "text/plain" }))) return;
    void fetch(COLLECT_PATH, { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: true }).catch(() => undefined);
  } catch {
    // Analytics must never break the page.
  }
}

const path = () => window.location.pathname.slice(0, 300) || "/";

function isReload(): boolean {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return nav?.type === "reload" || nav?.type === "back_forward";
  } catch {
    return false;
  }
}

/** Records a page view. The first view of a document load may start a visit. */
export function trackPageview(): void {
  if (!trackingAllowed()) {
    firstView = false;
    return;
  }
  const beacon: Beacon = { k: "pv", p: path(), w: Math.round(window.innerWidth), e: 0 };
  if (firstView && !isReload()) {
    let host = "";
    try {
      host = document.referrer ? new URL(document.referrer).hostname : "";
    } catch {
      host = "";
    }
    if (host !== window.location.hostname) {
      beacon.e = 1;
      if (host) beacon.r = host;
      const params = new URLSearchParams(window.location.search);
      const us = params.get("utm_source");
      const um = params.get("utm_medium");
      const uc = params.get("utm_campaign");
      if (us) beacon.us = us.slice(0, 60);
      if (um) beacon.um = um.slice(0, 60);
      if (uc) beacon.uc = uc.slice(0, 60);
    }
  }
  firstView = false;
  send(beacon);
}

/** Records an interaction. Details outside the event's allowlist are dropped. */
export function track(name: EventName, detail?: string): void {
  if (!trackingAllowed()) return;
  const allowed: readonly string[] = EVENTS[name];
  send({ k: "ev", p: path(), n: name, ...(detail && allowed.includes(detail) ? { d: detail } : {}) });
}

/** Classifies a click: explicit `data-track`, or phone / email / map links. */
export function eventForClick(target: EventTarget | null): { name: EventName; detail?: string } | null {
  if (!(target instanceof Element)) return null;
  const tagged = target.closest<HTMLElement>("[data-track]");
  if (tagged) {
    const [name, detail] = (tagged.dataset.track ?? "").split(":");
    if (name && name in EVENTS) return { name: name as EventName, detail };
  }
  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (!link) return null;
  const href = link.getAttribute("href") ?? "";
  if (href.startsWith("tel:")) return { name: "phone_click" };
  if (href.startsWith("mailto:")) return { name: "email_click" };
  if (/^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.|maps\.apple\.com)/i.test(href)) return { name: "directions_click" };
  return null;
}

/** Test helper. */
export function resetAnalyticsClient(): void {
  enabled = false;
  firstView = true;
}
