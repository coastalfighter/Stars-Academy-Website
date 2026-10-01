import type { Locale } from "@/i18n/config";
import { HTML_LANG } from "@/i18n/config";
import type { Localized } from "./schemas";

export type LocalizedText = {
  text: string;
  /** Set when the text is shown in a different language than the page (missing translation). */
  lang?: string;
};

/**
 * Picks the visitor's language, falling back to English when a Spanish
 * translation hasn't been entered yet. The fallback is marked with a `lang`
 * attribute so screen readers pronounce it correctly.
 */
export function pick(field: Localized, locale: Locale): LocalizedText {
  if (locale === "es" && field.es) return { text: field.es };
  if (locale === "en") return { text: field.en };
  return { text: field.en, lang: HTML_LANG.en };
}

/** Splits multi-paragraph text entered in the CMS on blank lines. */
export const paragraphs = (text: string): string[] =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
