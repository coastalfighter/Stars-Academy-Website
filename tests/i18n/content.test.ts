import { getContent } from "@/content";
import { getDictionary } from "@/i18n/dictionary";
import { homeCopy } from "@/content/copy/home";
import { approachCopy } from "@/content/copy/approach";
import { aboutCopy } from "@/content/copy/about";
import { servicesCopy } from "@/content/copy/services";
import { gettingStartedCopy } from "@/content/copy/gettingStarted";
import { familiesCopy } from "@/content/copy/families";
import { faqCopy } from "@/content/copy/faq";
import { contactCopy } from "@/content/copy/contact";
import { legalCopy } from "@/content/copy/legal";
import { VALIDATION_CODES, VALIDATION_MESSAGES } from "@/i18n/messages";

/** Flattens nested copy into [path, value] string leaves. */
function leaves(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${path}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  }
  return [];
}

const COPIES = {
  dictionary: { en: getDictionary("en"), es: getDictionary("es") },
  home: homeCopy,
  approach: approachCopy,
  about: aboutCopy,
  services: servicesCopy,
  gettingStarted: gettingStartedCopy,
  families: familiesCopy,
  faq: faqCopy,
  contact: contactCopy,
  legal: legalCopy,
} as const;

/** Strings that are legitimately identical in both languages. */
const SAME_IN_BOTH = /^(STARS.*|Conscious Discipline|English|Español|No|Email|FAQ|Facebook|Instagram|20\d\d|\d.*| ?\([^)]*\)|)$/;

describe("Spanish translation coverage", () => {
  it.each(Object.entries(COPIES))("%s has the same shape in both languages", (_, copy) => {
    // Lists may differ in length (e.g. the Spanish nav links differ), so compare shape, not indices.
    const shape = (c: unknown) => [...new Set(leaves(c).map(([p]) => p.replace(/\[\d+\]/g, "[]")))].sort();
    expect(shape(copy.es)).toEqual(shape(copy.en));
  });

  it.each(Object.entries(COPIES))("%s has no untranslated English left in Spanish", (_, copy) => {
    const en = new Map(leaves(copy.en));
    const untranslated = leaves(copy.es).filter(
      ([p, v]) => !p.endsWith(".key") && v.length > 0 && v === en.get(p) && !SAME_IN_BOTH.test(v),
    );
    expect(untranslated).toEqual([]);
  });

  it("translates every service, FAQ and page list", () => {
    const en = getContent("en");
    const es = getContent("es");
    expect(es.services.map((s) => s.slug)).toEqual(en.services.map((s) => s.slug));
    es.services.forEach((s, i) => expect(s.headline).not.toBe(en.services[i]?.headline));
    expect(es.dayTimeline.map((d) => d.hour)).toEqual(en.dayTimeline.map((d) => d.hour));
    expect(es.pages.approachPillars.map((p) => p.id)).toEqual(en.pages.approachPillars.map((p) => p.id));
    for (const f of es.faqs) expect(f.answer.join(" ")).not.toMatch(/client to confirm|\[|\]/i);
  });

  it("keeps facts identical across languages", () => {
    const en = getContent("en").site;
    const es = getContent("es").site;
    expect(es.phone).toEqual(en.phone);
    expect(es.address).toEqual(en.address);
    expect(es.secureForms).toEqual(en.secureForms);
    expect(es.stats.map((s) => s.value)).toEqual(en.stats.map((s) => s.value));
  });

  it("has a message for every validation code in both languages", () => {
    for (const code of VALIDATION_CODES) {
      expect(VALIDATION_MESSAGES.en[code]).toBeTruthy();
      expect(VALIDATION_MESSAGES.es[code]).toBeTruthy();
      expect(VALIDATION_MESSAGES.es[code]).not.toBe(VALIDATION_MESSAGES.en[code]);
    }
  });
});
