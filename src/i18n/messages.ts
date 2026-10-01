import type { Locale } from "./config";

/**
 * Messages shared by the browser form and the API: validation codes emitted
 * by the zod schema, and server responses. Kept outside the UI dictionaries
 * so the API route never bundles page copy.
 */

export const VALIDATION_CODES = [
  "tooLong",
  "invalid",
  "audience.required",
  "reason.required",
  "name.required",
  "email.invalid",
  "phone.invalid",
  "date.invalid",
  "consent.required",
  "contact.required",
  "email.requiredForPreference",
  "phone.requiredForPreference",
  "position.required",
  "organization.required",
  "phi.dob",
  "phi.date",
  "phi.ssn",
  "phi.memberId",
] as const;

export type ValidationCode = (typeof VALIDATION_CODES)[number];

const PHI_EN = "Please remove medical or identifying details — we’ll collect those through a secure channel.";
const PHI_ES = "Por favor, quite los datos médicos o de identificación; los recopilaremos por un medio seguro.";

export const VALIDATION_MESSAGES: Record<Locale, Record<ValidationCode, string>> = {
  en: {
    tooLong: "Please keep this shorter.",
    invalid: "Please check this field.",
    "audience.required": "Please tell us who you are.",
    "reason.required": "Please choose how we can help.",
    "name.required": "Please enter your name.",
    "email.invalid": "Please enter a valid email address.",
    "phone.invalid": "Please enter a 10-digit U.S. phone number.",
    "date.invalid": "Please enter a valid date.",
    "consent.required": "Please confirm you have not included medical information.",
    "contact.required": "Please share a phone number or email so we can reach you.",
    "email.requiredForPreference": "Add an email address, or choose phone as your preferred contact.",
    "phone.requiredForPreference": "Add a phone number, or choose email as your preferred contact.",
    "position.required": "Please choose the role you’re interested in.",
    "organization.required": "Please enter your practice, school or organization.",
    "phi.dob": `It looks like this includes a date of birth. ${PHI_EN}`,
    "phi.date": `It looks like this includes a date. ${PHI_EN}`,
    "phi.ssn": `It looks like this includes a Social Security number. ${PHI_EN}`,
    "phi.memberId": `It looks like this includes an insurance, member or record number. ${PHI_EN}`,
  },
  es: {
    tooLong: "Por favor, escriba un texto más corto.",
    invalid: "Por favor, revise este campo.",
    "audience.required": "Por favor, díganos quién es usted.",
    "reason.required": "Por favor, elija cómo podemos ayudarle.",
    "name.required": "Por favor, escriba su nombre.",
    "email.invalid": "Por favor, escriba un correo electrónico válido.",
    "phone.invalid": "Por favor, escriba un número de teléfono de EE. UU. de 10 dígitos.",
    "date.invalid": "Por favor, escriba una fecha válida.",
    "consent.required": "Por favor, confirme que no incluyó información médica.",
    "contact.required": "Por favor, comparta un teléfono o correo electrónico para poder comunicarnos con usted.",
    "email.requiredForPreference": "Agregue un correo electrónico o elija el teléfono como forma de contacto preferida.",
    "phone.requiredForPreference": "Agregue un número de teléfono o elija el correo electrónico como forma de contacto preferida.",
    "position.required": "Por favor, elija el puesto que le interesa.",
    "organization.required": "Por favor, escriba el nombre de su consultorio, escuela u organización.",
    "phi.dob": `Parece que el mensaje incluye una fecha de nacimiento. ${PHI_ES}`,
    "phi.date": `Parece que el mensaje incluye una fecha. ${PHI_ES}`,
    "phi.ssn": `Parece que el mensaje incluye un número de Seguro Social. ${PHI_ES}`,
    "phi.memberId": `Parece que el mensaje incluye un número de seguro, de afiliado o de expediente. ${PHI_ES}`,
  },
};

export const isValidationCode = (value: string): value is ValidationCode =>
  (VALIDATION_CODES as readonly string[]).includes(value);

/** Translates a validation code; anything unexpected falls back to a generic message. */
export const validationMessage = (code: string, locale: Locale): string =>
  VALIDATION_MESSAGES[locale][isValidationCode(code) ? code : "invalid"];

export type ServerMessageKey =
  | "badOrigin"
  | "unsupportedType"
  | "tooLarge"
  | "unreadable"
  | "rateLimited"
  | "checkFields"
  | "received"
  | "thanks"
  | "unavailable"
  | "failed";

export function serverMessage(key: ServerMessageKey, locale: Locale, phone: string): string {
  const call =
    locale === "es"
      ? `Por favor, llámenos al ${phone} (lunes a viernes, de 7:00 a. m. a 3:00 p. m.).`
      : `Please call us at ${phone} (Weekdays 7:00 a.m.–3:00 p.m.).`;
  const text: Record<Locale, Record<ServerMessageKey, string>> = {
    en: {
      badOrigin: "This request isn’t allowed from that origin.",
      unsupportedType: "Unsupported content type.",
      tooLarge: "Request is too large.",
      unreadable: "We couldn’t read that request.",
      rateLimited: `Too many requests. ${call}`,
      checkFields: "Please check the highlighted fields.",
      received: "Thank you — our team will be in touch.",
      thanks: "Thank you — our team will contact you within one business day.",
      unavailable: `Our online form is temporarily unavailable. ${call}`,
      failed: `We couldn’t send your message just now. ${call}`,
    },
    es: {
      badOrigin: "No se permite esta solicitud desde ese origen.",
      unsupportedType: "Tipo de contenido no compatible.",
      tooLarge: "La solicitud es demasiado grande.",
      unreadable: "No pudimos leer esa solicitud.",
      rateLimited: `Demasiadas solicitudes. ${call}`,
      checkFields: "Por favor, revise los campos señalados.",
      received: "Gracias. Nuestro equipo se comunicará con usted.",
      thanks: "Gracias. Nuestro equipo se comunicará con usted en un plazo de un día hábil.",
      unavailable: `Nuestro formulario en línea no está disponible por el momento. ${call}`,
      failed: `No pudimos enviar su mensaje en este momento. ${call}`,
    },
  };
  return text[locale][key];
}
