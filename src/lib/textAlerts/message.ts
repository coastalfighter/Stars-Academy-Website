/**
 * Composes the text families receive, and counts SMS segments.
 *
 * Texts are billed and split in segments. The GSM-7 alphabet fits 160
 * characters (153 per part when split), but one character outside it,
 * such as Spanish á, í, ó or ú, switches the whole text to UCS-2: 70 (67)
 * characters. Bilingual closure texts are usually UCS-2, so the cap is
 * counted that way, not guessed.
 */

const GSM7 =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM7_EXTENDED = "^{}\\[~]|€";

export type Segments = { encoding: "GSM-7" | "UCS-2"; units: number; segments: number };

export function countSegments(text: string): Segments {
  let units = 0;
  let gsm = true;
  for (const ch of text) {
    if (GSM7.includes(ch)) units += 1;
    else if (GSM7_EXTENDED.includes(ch)) units += 2;
    else {
      gsm = false;
      break;
    }
  }
  if (gsm) return { encoding: "GSM-7", units, segments: units <= 160 ? 1 : Math.ceil(units / 153) };
  // UCS-2 counts UTF-16 code units (emoji take two).
  const u = text.length;
  return { encoding: "UCS-2", units: u, segments: u <= 70 ? 1 : Math.ceil(u / 67) };
}

/** At most four parts per alert: enough for a short bilingual notice. */
export const MAX_SEGMENTS = 4;

export function composeTextAlert({ en, es }: { en: string; es: string | null }): string {
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();
  return [`STARS Academy: ${clean(en)}`, es ? clean(es) : null, "Reply STOP to opt out / STOP para cancelar"].filter(Boolean).join("\n");
}
