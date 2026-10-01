import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  description:
    "Appears on the Our Team page; leadership also appears on About. Never include health information about children or staff.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required().max(100) }),
    defineField({ name: "credentials", title: "Credentials", type: "string", description: "e.g. M.S., CCC-SLP" }),
    defineField({ name: "role", title: "Role", type: "localeString", validation: (r) => r.required() }),
    defineField({
      name: "group",
      title: "Team",
      type: "string",
      options: {
        list: [
          { title: "Leadership", value: "leadership" },
          { title: "Therapy (speech, occupational, physical)", value: "therapy" },
          { title: "Nursing", value: "nursing" },
          { title: "Classrooms & education", value: "education" },
          { title: "Transportation, office & support", value: "support" },
        ],
        layout: "radio",
      },
      initialValue: "therapy",
      validation: (r) => r.required(),
    }),
    defineField({ name: "speaksSpanish", title: "Works with families in Spanish", type: "boolean", initialValue: false }),
    defineField({ name: "bio", title: "Short bio", type: "localeText", description: "2–3 sentences: background, what they love about their work." }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description: "A head-and-shoulders photo of this staff member only (no children).",
    }),
    defineField({
      name: "photoConsent",
      title: "This person agreed to their photo being on the website",
      type: "boolean",
      initialValue: false,
      hidden: ({ document }) => !(document as { photo?: { asset?: unknown } } | undefined)?.photo?.asset,
      validation: (r) =>
        r.custom((value: boolean | undefined, ctx) => {
          const hasPhoto = Boolean((ctx.document as { photo?: { asset?: unknown } } | undefined)?.photo?.asset);
          return !hasPhoto || value === true ? true : { message: "Without their agreement, the photo won’t be shown (the bio still will).", level: "warning" };
        }),
    }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 100 }),
  ],
  preview: { select: { title: "name", subtitle: "role.en", media: "photo" } },
});
