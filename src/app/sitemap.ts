import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { services } from "@/content/services";

type Entry = { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] };

/** Every public page. Kept in sync with src/app by tests/content/routes.test.ts. */
export const STATIC_ROUTES: Entry[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/getting-started", priority: 0.95, changeFrequency: "monthly" },
  { path: "/schedule-a-tour", priority: 0.9, changeFrequency: "yearly" },
  { path: "/services", priority: 0.9, changeFrequency: "yearly" },
  { path: "/referrals", priority: 0.85, changeFrequency: "yearly" },
  { path: "/approach", priority: 0.8, changeFrequency: "yearly" },
  { path: "/about-us", priority: 0.7, changeFrequency: "yearly" },
  { path: "/careers", priority: 0.8, changeFrequency: "monthly" },
  { path: "/careers/apply", priority: 0.6, changeFrequency: "yearly" },
  { path: "/families", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact-us", priority: 0.7, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/accessibility", priority: 0.2, changeFrequency: "yearly" },
  { path: "/nondiscrimination", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const serviceRoutes: Entry[] = services.map((s) => ({
    path: `/services/${s.slug}`,
    priority: 0.8,
    changeFrequency: "yearly",
  }));
  return [...STATIC_ROUTES, ...serviceRoutes].map((r) => ({
    url: `${site.url}${r.path === "/" ? "" : r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
