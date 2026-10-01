import { defineField, defineType } from "sanity";

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({
      name: "group",
      title: "Audience",
      type: "string",
      options: {
        list: [
          { title: "Families considering STARS", value: "families" },
          { title: "Current families", value: "current" },
          { title: "Physicians & referral partners", value: "partners" },
          { title: "Job seekers", value: "jobs" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "question", title: "Question", type: "localeString", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "Answer", type: "localeText", validation: (r) => r.required() }),
    defineField({
      name: "key",
      title: "Permanent ID",
      type: "slug",
      description: "Used in links to this question. Generate it once and don’t change it.",
      options: { source: "question.en", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Order", type: "number", description: "Lower numbers appear first.", initialValue: 100 }),
  ],
  orderings: [{ title: "Display order", name: "order", by: [{ field: "group", direction: "asc" }, { field: "order", direction: "asc" }] }],
  preview: { select: { title: "question.en", subtitle: "group" } },
});
