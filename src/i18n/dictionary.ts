import type { Locale, Widen } from "./config";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import type { RouteKey } from "./routes";

type Shape = Widen<typeof en>;

/** UI dictionary, with navigation keys typed back to real routes. */
export type Dictionary = Omit<Shape, "nav" | "footer"> & {
  nav: { primary: readonly NavEntry[]; utility: readonly NavEntry[] };
  footer: Omit<Shape["footer"], "forYouLinks" | "legal"> & {
    forYouLinks: readonly NavEntry[];
    legal: readonly NavEntry[];
  };
};
export type NavEntry = { readonly label: string; readonly key: RouteKey };

const dictionaries: Record<Locale, Dictionary> = { en, es };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
