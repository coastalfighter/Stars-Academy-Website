import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  description: "Open houses, family nights, community events and hiring days. Shown on the Events page until they end.",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Web address",
      type: "slug",
      options: { source: "title.en", maxLength: 80 },
      description: "Click Generate. Used for the add-to-calendar link.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "summary", title: "Details", type: "localeText", description: "What to expect, what to bring, whether children are welcome." }),
    defineField({ name: "startsAt", title: "Starts", type: "datetime", validation: (r) => r.required() }),
    defineField({
      name: "endsAt",
      title: "Ends",
      type: "datetime",
      validation: (r) =>
        r.custom((endsAt: string | undefined, ctx) => {
          const startsAt = (ctx.document as { startsAt?: string } | undefined)?.startsAt;
          return endsAt && startsAt && Date.parse(endsAt) <= Date.parse(startsAt) ? "“Ends” must be later than “Starts”." : true;
        }),
    }),
    defineField({ name: "allDay", title: "All-day event", type: "boolean", initialValue: false }),
    defineField({
      name: "audience",
      title: "Who it’s for",
      type: "string",
      options: {
        list: [
          { title: "Families", value: "families" },
          { title: "Community", value: "community" },
          { title: "Physicians & professionals", value: "professionals" },
          { title: "Job seekers", value: "jobs" },
        ],
        layout: "radio",
      },
      initialValue: "families",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "location",
      title: "Where",
      type: "string",
      options: {
        list: [
          { title: "Main campus (200 General St.)", value: "main" },
          { title: "South campus", value: "south" },
          { title: "Online", value: "online" },
          { title: "Somewhere else (describe below)", value: "other" },
        ],
        layout: "radio",
      },
      initialValue: "main",
      validation: (r) => r.required(),
    }),
    defineField({ name: "locationDetail", title: "Location details", type: "localeString", description: "Room, address, or how to join online." }),
    defineField({ name: "spanishAvailable", title: "Spanish interpretation available", type: "boolean", initialValue: false }),
    defineField({
      name: "registration",
      title: "Registration",
      type: "object",
      fields: [
        defineField({
          name: "kind",
          title: "How to sign up",
          type: "string",
          options: {
            list: [
              { title: "No sign-up needed", value: "none" },
              { title: "Call STARS", value: "call" },
              { title: "Sign-up link", value: "link" },
            ],
            layout: "radio",
          },
          initialValue: "none",
        }),
        defineField({
          name: "href",
          title: "Sign-up link",
          type: "url",
          hidden: ({ parent }) => (parent as { kind?: string } | undefined)?.kind !== "link",
          validation: (r) => r.uri({ scheme: ["https"] }),
        }),
      ],
    }),
  ],
  orderings: [{ title: "Soonest first", name: "startsAsc", by: [{ field: "startsAt", direction: "asc" }] }],
  preview: {
    select: { title: "title.en", startsAt: "startsAt" },
    prepare: ({ title, startsAt }) => ({ title, subtitle: startsAt ? new Date(startsAt).toLocaleString() : "" }),
  },
});
