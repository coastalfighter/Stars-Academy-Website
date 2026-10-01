/** Supported languages. English is the default and lives at the site root; Spanish lives under /es. */
export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** BCP 47 tags for <html lang> and hreflang (U.S. audience for both). */
export const HTML_LANG: Record<Locale, string> = { en: "en-US", es: "es-US" };
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", es: "es_US" };

/** Each language's name written in that language (for the switcher). */
export const LANGUAGE_NAME: Record<Locale, string> = { en: "English", es: "Español" };

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/**
 * Converts `as const` literal types into their widened equivalents, so a
 * translation can be type-checked against the English shape without having to
 * repeat English literal strings.
 */
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : T extends object
          ? { readonly [K in keyof T]: Widen<T[K]> }
          : T;
