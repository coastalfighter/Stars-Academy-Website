import type { Locale, Widen } from "@/i18n/config";
import type { RouteKey } from "@/i18n/routes";
import * as enSite from "./site";
import * as enPages from "./pages";
import * as enFaq from "./faq";
import { services as enServices, type Service, type ServiceSlug } from "./services";
import { photos as enPhotos } from "./photos";
import * as esSite from "./es/site";
import * as esPages from "./es/pages";
import * as esFaq from "./es/faq";
import { services as esServices } from "./es/services";
import { photos as esPhotos } from "./es/photos";
import type { ApproachPillar, Step } from "./pages";
import type { Faq, FaqGroupId } from "./faq";

type Linked<T> = Omit<T, "key"> & { readonly key: RouteKey };

/**
 * Everything a page needs to render in one language. English is the source;
 * the Spanish bundle is type-checked against the same shape, so a missing
 * translation is a compile error rather than a blank on the page.
 */
export type ContentBundle = {
  locale: Locale;
  site: Widen<typeof enSite.site> & { acronymMeaning?: string };
  pathways: readonly Linked<Widen<(typeof enSite.pathways)[number]>>[];
  pillars: Widen<typeof enSite.pillars>;
  dayTimeline: Widen<typeof enSite.dayTimeline>;
  approachPrinciples: Widen<typeof enSite.approachPrinciples>;
  fitSignals: Widen<typeof enSite.fitSignals>;
  enrollmentSteps: Widen<typeof enSite.enrollmentSteps>;
  referralFacts: Widen<typeof enSite.referralFacts>;
  referralCriteria: Widen<typeof enSite.referralCriteria>;
  careerRoles: Widen<typeof enSite.careerRoles>;
  values: Widen<typeof enSite.values>;
  nondiscriminationSummary: string;
  services: Service[];
  pages: {
    approachPillars: ApproachPillar[];
    approachForFamilies: Widen<typeof enPages.approachForFamilies>;
    aboutStory: Widen<typeof enPages.aboutStory>;
    aboutVision: string;
    togetherReasons: Step[];
    goodFitSignals: Widen<typeof enPages.goodFitSignals>;
    eligibilityFactors: Step[];
    firstCallToFirstDay: Step[];
    familyTopics: Widen<typeof enPages.familyTopics>;
    whoHandlesWhat: readonly Linked<Widen<(typeof enPages.whoHandlesWhat)[number]>>[];
  };
  faqGroups: { id: FaqGroupId; label: string }[];
  faqs: Faq[];
  photos: Widen<typeof enPhotos>;
};

const pagesFrom = (p: typeof enPages | typeof esPages): ContentBundle["pages"] => ({
  approachPillars: p.approachPillars,
  approachForFamilies: p.approachForFamilies,
  aboutStory: p.aboutStory,
  aboutVision: p.aboutVision,
  togetherReasons: p.togetherReasons,
  goodFitSignals: p.goodFitSignals,
  eligibilityFactors: p.eligibilityFactors,
  firstCallToFirstDay: p.firstCallToFirstDay,
  familyTopics: p.familyTopics,
  whoHandlesWhat: p.whoHandlesWhat,
});

const bundles: Record<Locale, ContentBundle> = {
  en: {
    locale: "en",
    site: enSite.site,
    pathways: enSite.pathways,
    pillars: enSite.pillars,
    dayTimeline: enSite.dayTimeline,
    approachPrinciples: enSite.approachPrinciples,
    fitSignals: enSite.fitSignals,
    enrollmentSteps: enSite.enrollmentSteps,
    referralFacts: enSite.referralFacts,
    referralCriteria: enSite.referralCriteria,
    careerRoles: enSite.careerRoles,
    values: enSite.values,
    nondiscriminationSummary: enSite.nondiscriminationSummary,
    services: enServices,
    pages: pagesFrom(enPages),
    faqGroups: enFaq.faqGroups,
    faqs: enFaq.faqs,
    photos: enPhotos,
  },
  es: {
    locale: "es",
    site: esSite.site,
    pathways: esSite.pathways,
    pillars: esSite.pillars,
    dayTimeline: esSite.dayTimeline,
    approachPrinciples: esSite.approachPrinciples,
    fitSignals: esSite.fitSignals,
    enrollmentSteps: esSite.enrollmentSteps,
    referralFacts: esSite.referralFacts,
    referralCriteria: esSite.referralCriteria,
    careerRoles: esSite.careerRoles,
    values: esSite.values,
    nondiscriminationSummary: esSite.nondiscriminationSummary,
    services: esServices,
    pages: pagesFrom(esPages),
    faqGroups: esFaq.faqGroups,
    faqs: esFaq.faqs,
    photos: esPhotos,
  },
};

export const getContent = (locale: Locale): ContentBundle => bundles[locale];

export const findService = (c: ContentBundle, slug: ServiceSlug): Service | undefined =>
  c.services.find((s) => s.slug === slug);

export const faqsIn = (c: ContentBundle, group: FaqGroupId): Faq[] => c.faqs.filter((f) => f.group === group);

export const faqsWithIds = (c: ContentBundle, ids: readonly string[]): Faq[] =>
  ids.map((id) => c.faqs.find((f) => f.id === id)).filter((f): f is Faq => Boolean(f));
