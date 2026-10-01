import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Leadership",
  type: "document",
  description: "Appears on the About page once at least one person is published.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required().max(100) }),
    defineField({ name: "credentials", title: "Credentials", type: "string", description: "e.g. M.S., CCC-SLP" }),
    defineField({ name: "role", title: "Role", type: "localeString", validation: (r) => r.required() }),
    defineField({ name: "bio", title: "Short bio", type: "localeText" }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 100 }),
  ],
  preview: { select: { title: "name", subtitle: "role.en" } },
});
