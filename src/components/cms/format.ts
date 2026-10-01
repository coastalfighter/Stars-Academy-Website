import { HTML_LANG, type Locale } from "@/i18n/config";

/** STARS is in Batesville, Arkansas — times are shown in Central Time. */
export const CLINIC_TIME_ZONE = "America/Chicago";

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(HTML_LANG[locale], {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: CLINIC_TIME_ZONE,
  }).format(new Date(iso));
}
