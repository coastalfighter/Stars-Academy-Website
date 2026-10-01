import { defineField, defineType } from "sanity";

export const jobOpening = defineType({
  name: "jobOpening",
  title: "Job opening",
  type: "document",
  description: "Shown on the Careers page (English only). Turn off “Open” to hide a role without deleting it.",
  fields: [
    defineField({ name: "title", title: "Job title", type: "string", validation: (r) => r.required().max(120) }),
    defineField({ name: "team", title: "Team", type: "string", options: { list: ["Classroom", "Therapy", "Nursing", "Transportation", "Administration"] }, validation: (r) => r.required() }),
    defineField({ name: "body", title: "Description", type: "text", rows: 4, validation: (r) => r.required().max(800) }),
    defineField({ name: "requirements", title: "Requirements", type: "array", of: [{ type: "string" }], validation: (r) => r.max(10) }),
    defineField({
      name: "position",
      title: "Application form role",
      type: "string",
      description: "Pre-selects this role on the application form.",
      options: {
        list: [
          { title: "Early Childhood Developmental Specialist", value: "ecds" },
          { title: "Early Childhood Developmental Technician", value: "ecdt" },
          { title: "Van Rider", value: "van-rider" },
          { title: "Van Driver", value: "van-driver" },
          { title: "Therapists & Nurses", value: "clinical" },
          { title: "Other", value: "not-sure" },
        ],
      },
    }),
    defineField({ name: "open", title: "Open", type: "boolean", initialValue: true }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 100 }),
  ],
  preview: {
    select: { title: "title", team: "team", open: "open" },
    prepare: ({ title, team, open }) => ({ title, subtitle: `${team}${open ? "" : " · closed"}` }),
  },
});
