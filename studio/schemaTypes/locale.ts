import { defineField, defineType, type StringRule } from "sanity";

/**
 * Bilingual fields. English is required; Spanish is strongly encouraged —
 * without it, Spanish-speaking families see the English text (marked as
 * English for screen readers).
 */
const spanishWarning = (rule: StringRule) =>
  rule.custom((value: unknown) =>
    value ? true : { message: "Spanish translation missing — Spanish-speaking families will see the English text.", level: "warning" },
  );

/** Warns (doesn't block) when text looks like it contains protected health information. */
export const phiWarning = (rule: StringRule) =>
  rule.custom((value: unknown) => {
    if (typeof value !== "string") return true;
    const looksLikePhi =
      /\b\d{1,2}[/.-]\d{1,2}[/.-](\d{4}|\d{2})\b/.test(value) ||
      /\b(d\.?o\.?b|date of birth|fecha de nacimiento|diagnos[ie]s|diagnóstico|medicaid (id|#|number)|ssn|seguro social)\b/i.test(value);
    return looksLikePhi
      ? { message: "This looks like it may include a child’s health or identifying details. Public pages must never contain PHI.", level: "warning" }
      : true;
  });

export const localeString = defineType({
  name: "localeString",
  title: "Text (English & Spanish)",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "string", validation: (r) => [r.required(), phiWarning(r)] }),
    defineField({ name: "es", title: "Español", type: "string", validation: (r) => [spanishWarning(r), phiWarning(r)] }),
  ],
});

export const localeText = defineType({
  name: "localeText",
  title: "Paragraphs (English & Spanish)",
  type: "object",
  description: "Leave a blank line between paragraphs.",
  fields: [
    defineField({ name: "en", title: "English", type: "text", rows: 4, validation: (r) => [r.required(), phiWarning(r)] }),
    defineField({ name: "es", title: "Español", type: "text", rows: 4, validation: (r) => [spanishWarning(r), phiWarning(r)] }),
  ],
});

/** Same rule the website enforces: http(s), tel:, mailto: or a site path like /families. */
export const SAFE_HREF = /^(https?:\/\/|tel:|mailto:|\/(?!\/))/i;
