import { defineField, defineType } from "sanity";

/** Singleton (document ID "siteSettings"): contact details beyond the main phone and address. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Contact details",
  type: "document",
  fields: [
    defineField({ name: "fax", title: "Fax number", type: "string", validation: (r) => r.max(30) }),
    defineField({ name: "email", title: "General email", type: "string", validation: (r) => r.email() }),
    defineField({
      name: "southCampus",
      title: "STARS Academy South",
      type: "object",
      fields: [
        defineField({ name: "street", title: "Street", type: "string" }),
        defineField({ name: "city", title: "City", type: "string", initialValue: "Batesville" }),
        defineField({ name: "region", title: "State", type: "string", initialValue: "AR" }),
        defineField({ name: "postalCode", title: "ZIP code", type: "string" }),
        defineField({ name: "note", title: "What’s offered here", type: "localeString" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Contact details" }) },
});
