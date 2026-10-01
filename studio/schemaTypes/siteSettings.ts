import { defineField, defineType } from "sanity";

/** Singleton (document ID "siteSettings"): contact details beyond the main phone and address. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Contact details & secure forms",
  type: "document",
  fields: [
    defineField({ name: "fax", title: "Fax number", type: "string", group: "contact", validation: (r) => r.max(30) }),
    defineField({ name: "email", title: "General email", type: "string", group: "contact", validation: (r) => r.email() }),
    defineField({
      name: "southCampus",
      title: "STARS Academy South",
      type: "object",
      group: "contact",
      fields: [
        defineField({ name: "street", title: "Street", type: "string" }),
        defineField({ name: "city", title: "City", type: "string", initialValue: "Batesville" }),
        defineField({ name: "region", title: "State", type: "string", initialValue: "AR" }),
        defineField({ name: "postalCode", title: "ZIP code", type: "string" }),
        defineField({ name: "note", title: "What’s offered here", type: "localeString" }),
      ],
    }),
    defineField({
      name: "enrollmentFormEn",
      title: "Secure enrollment form (English)",
      type: "url",
      group: "secure",
      description:
        "The HIPAA-covered online form families fill in to enroll. Leave empty to keep using the Adobe Sign enrollment packet. Only services on the approved list set by the web team will work; anything else is hidden and the team is alerted.",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    defineField({ name: "enrollmentFormEs", title: "Secure enrollment form (Español)", type: "url", group: "secure", validation: (r) => r.uri({ scheme: ["https"] }) }),
    defineField({
      name: "referralUploadUrl",
      title: "Secure upload link for physicians",
      type: "url",
      group: "secure",
      description: "Where referral partners upload prescriptions and records (a HIPAA-covered service STARS has a BAA with).",
      validation: (r) => r.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "directAddress",
      title: "Direct secure messaging address",
      type: "string",
      group: "secure",
      description: "For physicians’ EHRs, e.g. referrals@direct.mystarsacademy.org. Ask your EHR or HISP vendor.",
      validation: (r) => r.regex(/^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]*direct[A-Za-z0-9.-]*\.[A-Za-z]{2,}$/, { name: "Direct address" }),
    }),
    defineField({
      name: "textAlerts",
      title: "Text-message closure alerts",
      type: "object",
      group: "secure",
      description: "Families sign up by texting the keyword to this number at your text-message provider. The website never sees their numbers.",
      fields: [
        defineField({ name: "number", title: "Number families text", type: "string", description: "e.g. 870-555-0199 or a short code" }),
        defineField({ name: "keyword", title: "Keyword", type: "string", description: "One word, e.g. STARS", validation: (r) => r.regex(/^[A-Za-z0-9]{2,20}$/, { name: "one word" }) }),
      ],
    }),
  ],
  groups: [
    { name: "contact", title: "Contact", default: true },
    { name: "secure", title: "Secure forms & alerts" },
  ],
  preview: { prepare: () => ({ title: "Contact details" }) },
});
