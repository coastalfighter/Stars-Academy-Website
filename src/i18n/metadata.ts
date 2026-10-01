import type { Metadata, Viewport } from "next";
import { isIndexable, verificationTags } from "@/lib/launch/indexing";
import { site as enSite } from "@/content/site";
import { getContent } from "@/content";
import { homeCopy } from "@/content/copy/home";
import { OG_LOCALE, type Locale } from "./config";
import { alternates, serviceAlternates, type RouteKey } from "./routes";
import type { ServiceSlug } from "@/content/services";

const KEYWORDS: Record<Locale, string[]> = {
  en: [
    "pediatric therapy Batesville",
    "developmental preschool Arkansas",
    "speech therapy for children",
    "occupational therapy",
    "physical therapy",
    "pediatric nursing",
    "developmental day treatment",
    "ARKids First-A",
    "TEFRA",
  ],
  es: [
    "terapia pediátrica Batesville",
    "preescolar de desarrollo Arkansas",
    "terapia del habla en español",
    "terapia ocupacional para niños",
    "terapia física pediátrica",
    "enfermería pediátrica",
    "ARKids First-A",
    "TEFRA",
  ],
};

const OG_IMAGE_ALT: Record<Locale, string> = {
  en: "Preschoolers and teachers playing together on a classroom rug.",
  es: "Preescolares y maestras jugando juntos sobre una alfombra del aula.",
};

/** Metadata shared by every page of one language (set in that language's root layout). */
export function layoutMetadata(locale: Locale): Metadata {
  const { site } = getContent(locale);
  return {
    metadataBase: new URL(enSite.url),
    title: { default: homeCopy[locale].metaTitle, template: "%s | STARS Academy" },
    description: site.description,
    applicationName: site.name,
    keywords: KEYWORDS[locale],
    icons: { icon: "/favicon.svg" },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[locale === "en" ? "es" : "en"]],
      title: homeCopy[locale].metaTitle,
      description: site.description,
      images: [{ url: "/photos/classroom-play.webp", width: 1200, height: 801, alt: OG_IMAGE_ALT[locale] }],
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: true, address: true },
    ...(isIndexable() ? {} : { robots: { index: false, follow: false } }),
    ...(verificationTags() ? { verification: verificationTags() } : {}),
  };
}

export const viewport: Viewport = {
  themeColor: "#bbf2ff",
  width: "device-width",
  initialScale: 1,
};

/** Per-page metadata with canonical URL and hreflang alternates. */
export function pageMetadata(
  locale: Locale,
  key: RouteKey,
  { title, description }: { title?: string; description: string },
): Metadata {
  const alt = alternates(key, locale);
  return {
    ...(title ? { title } : {}),
    description,
    alternates: alt,
    openGraph: { url: alt.canonical, locale: OG_LOCALE[locale], description, ...(title ? { title } : {}) },
  };
}

export function serviceMetadata(
  locale: Locale,
  slug: ServiceSlug,
  { title, description }: { title: string; description: string },
): Metadata {
  const alt = serviceAlternates(slug, locale);
  return { title, description, alternates: alt, openGraph: { url: alt.canonical, locale: OG_LOCALE[locale], title, description } };
}
