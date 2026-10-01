import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Family testimonial",
  type: "document",
  description:
    "Only publish with signed written permission on file. Use a first name and the child’s age or program only — never last names, diagnoses or other health details.",
  fields: [
    defineField({ name: "quote", title: "Quote", type: "localeText", validation: (r) => r.required() }),
    defineField({ name: "attribution", title: "Attribution", type: "localeString", description: "e.g. “Maria, parent of a 4-year-old”", validation: (r) => r.required() }),
    defineField({
      name: "consentOnFile",
      title: "Written permission is on file",
      type: "boolean",
      initialValue: false,
      validation: (r) => r.required().custom((v: boolean | undefined) => (v === true ? true : "Testimonials can’t be published without written permission on file.")),
    }),
    defineField({ name: "consentDate", title: "Date permission was signed", type: "date", validation: (r) => r.required() }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 100 }),
  ],
  preview: { select: { title: "attribution.en", subtitle: "quote.en" } },
});
