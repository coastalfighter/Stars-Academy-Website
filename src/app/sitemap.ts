import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { HTML_LANG, LOCALES } from "@/i18n/config";
import { ROUTES, serviceHref, type RouteKey } from "@/i18n/routes";

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

const PRIORITY: Record<RouteKey, [number, Freq]> = {
  home: [1, "monthly"],
  gettingStarted: [0.95, "monthly"],
  tour: [0.9, "yearly"],
  services: [0.9, "yearly"],
  referrals: [0.85, "yearly"],
  approach: [0.8, "yearly"],
  careers: [0.8, "monthly"],
  about: [0.7, "yearly"],
  families: [0.7, "monthly"],
  faq: [0.7, "monthly"],
  contact: [0.7, "yearly"],
  apply: [0.6, "yearly"],
  privacy: [0.2, "yearly"],
  accessibility: [0.2, "yearly"],
  nondiscrimination: [0.2, "yearly"],
};

const abs = (path: string) => `${site.url}${path === "/" ? "" : path}`;

/**
 * Every public URL in every language, each listing its translations as
 * hreflang alternates (Google's recommended sitemap method for multilingual sites).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    const route = ROUTES[key];
    const [priority, changeFrequency] = PRIORITY[key];
    const languages: Record<string, string> = {};
    for (const l of LOCALES) {
      const path = route[l];
      if (path) languages[HTML_LANG[l]] = abs(path);
    }
    for (const l of LOCALES) {
      const path = route[l];
      if (!path) continue;
      entries.push({ url: abs(path), lastModified, changeFrequency, priority, alternates: { languages } });
    }
  }

  for (const s of services) {
    const languages = Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], abs(serviceHref(l, s.slug))]));
    for (const l of LOCALES) {
      entries.push({
        url: abs(serviceHref(l, s.slug)),
        lastModified,
        changeFrequency: "yearly",
        priority: 0.8,
        alternates: { languages },
      });
    }
  }
  return entries;
}
