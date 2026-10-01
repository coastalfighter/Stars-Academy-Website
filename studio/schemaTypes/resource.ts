import { defineField, defineType } from "sanity";

export const resource = defineType({
  name: "resource",
  title: "Family resource",
  type: "document",
  description: "Handouts and trusted links for families. Add a PDF or a link in each language you have.",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString", validation: (r) => r.required() }),
    defineField({ name: "summary", title: "One-sentence summary", type: "localeText", validation: (r) => r.required() }),
    defineField({
      name: "topic",
      title: "Topic",
      type: "string",
      options: {
        list: [
          { title: "Getting started at STARS", value: "getting-started" },
          { title: "Child development & milestones", value: "development" },
          { title: "Activities at home", value: "at-home" },
          { title: "Insurance & Medicaid", value: "insurance" },
          { title: "Community support", value: "community" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "publisher", title: "From", type: "string", description: "e.g. STARS Academy, CDC" }),
    defineField({ name: "fileEn", title: "PDF (English)", type: "file", options: { accept: "application/pdf" } }),
    defineField({ name: "fileEs", title: "PDF (Español)", type: "file", options: { accept: "application/pdf" } }),
    defineField({
      name: "link",
      title: "Or a link",
      type: "object",
      description: "Use https:// links, or a page on this site like /getting-started.",
      fields: [
        defineField({ name: "en", title: "English", type: "string", validation: (r) => r.regex(/^(https:\/\/|\/(?!\/))/, { name: "https or site path" }) }),
        defineField({ name: "es", title: "Español", type: "string", validation: (r) => r.regex(/^(https:\/\/|\/(?!\/))/, { name: "https or site path" }) }),
      ],
    }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 100 }),
  ],
  validation: (r) =>
    r.custom((doc: Record<string, unknown> | undefined) => {
      const link = (doc?.link ?? {}) as { en?: string; es?: string };
      const has = (f: unknown) => Boolean((f as { asset?: unknown } | undefined)?.asset);
      return has(doc?.fileEn) || has(doc?.fileEs) || link.en || link.es ? true : "Add a PDF or a link.";
    }),
  preview: { select: { title: "title.en", subtitle: "topic" } },
});
