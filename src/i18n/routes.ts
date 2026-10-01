import type { Locale } from "./config";
import type { ServiceSlug } from "@/content/services";

/**
 * Every public page and its address in each language. `es: null` means the
 * page is English-only (Spanish visitors are linked to it with a notice).
 * This map drives the language switcher, hreflang alternates and the sitemap.
 */
export const ROUTES = {
  home: { en: "/", es: "/es" },
  services: { en: "/services", es: "/es/servicios" },
  approach: { en: "/approach", es: "/es/nuestro-enfoque" },
  about: { en: "/about-us", es: "/es/sobre-nosotros" },
  gettingStarted: { en: "/getting-started", es: "/es/como-empezar" },
  families: { en: "/families", es: "/es/familias" },
  faq: { en: "/faq", es: "/es/preguntas-frecuentes" },
  contact: { en: "/contact-us", es: "/es/contacto" },
  tour: { en: "/schedule-a-tour", es: "/es/programar-visita" },
  privacy: { en: "/privacy", es: "/es/privacidad" },
  accessibility: { en: "/accessibility", es: "/es/accesibilidad" },
  nondiscrimination: { en: "/nondiscrimination", es: "/es/no-discriminacion" },
  events: { en: "/events", es: "/es/eventos" },
  resources: { en: "/resources", es: "/es/recursos" },
  team: { en: "/team", es: "/es/equipo" },
  photos: { en: "/photos", es: "/es/fotos" },
  referrals: { en: "/referrals", es: null },
  careers: { en: "/careers", es: null },
  apply: { en: "/careers/apply", es: null },
} as const satisfies Record<string, { en: string; es: string | null }>;

export type RouteKey = keyof typeof ROUTES;

/** Spanish slugs for the five service pages (English slugs are the stable ids). */
export const SERVICE_SLUGS: Record<ServiceSlug, { en: string; es: string }> = {
  "developmental-classrooms": { en: "developmental-classrooms", es: "aulas-de-desarrollo" },
  "speech-therapy": { en: "speech-therapy", es: "terapia-del-habla-y-lenguaje" },
  "occupational-therapy": { en: "occupational-therapy", es: "terapia-ocupacional" },
  "physical-therapy": { en: "physical-therapy", es: "terapia-fisica" },
  "nursing-care": { en: "nursing-care", es: "enfermeria" },
};

/** True when a page exists in the given language. */
export const hasLocale = (key: RouteKey, locale: Locale): boolean => ROUTES[key][locale] !== null;

/**
 * Link to a page in the visitor's language, falling back to English when the
 * page has no translation. `hash` may include the leading "#".
 */
export function href(locale: Locale, key: RouteKey, hash = ""): string {
  const path = ROUTES[key][locale] ?? ROUTES[key].en;
  return `${path}${hash}`;
}

export const serviceHref = (locale: Locale, slug: ServiceSlug): string =>
  `${href(locale, "services")}/${SERVICE_SLUGS[slug][locale]}`;

export function serviceSlugFromLocal(locale: Locale, local: string): ServiceSlug | undefined {
  return (Object.keys(SERVICE_SLUGS) as ServiceSlug[]).find((id) => SERVICE_SLUGS[id][locale] === local);
}

/** Language of a pathname. */
export const localeFromPath = (pathname: string): Locale =>
  pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";

const normalize = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p);

/**
 * The same page in the other language, or null if it has no translation.
 * Handles static routes and service detail pages.
 */
export function counterpartPath(pathname: string, target: Locale): string | null {
  const path = normalize(pathname.split(/[?#]/)[0] || "/");
  const from = localeFromPath(path);
  if (from === target) return path;

  for (const route of Object.values(ROUTES)) {
    if (route[from] === path) return route[target];
  }

  const servicesBase = ROUTES.services[from];
  if (path.startsWith(`${servicesBase}/`)) {
    const id = serviceSlugFromLocal(from, path.slice(servicesBase.length + 1));
    if (id) return serviceHref(target, id);
  }
  return null;
}

/** hreflang alternates for a page key (only languages where the page exists). */
export function alternates(key: RouteKey, current: Locale) {
  const route = ROUTES[key];
  const languages: Record<string, string> = { "en-US": route.en };
  if (route.es) languages["es-US"] = route.es;
  languages["x-default"] = route.en;
  return { canonical: route[current] ?? route.en, languages };
}

export function serviceAlternates(slug: ServiceSlug, current: Locale) {
  return {
    canonical: serviceHref(current, slug),
    languages: { "en-US": serviceHref("en", slug), "es-US": serviceHref("es", slug), "x-default": serviceHref("en", slug) },
  };
}
