import { defineField, defineType } from "sanity";
import { SAFE_HREF } from "./locale";

export const announcement = defineType({
  name: "announcement",
  title: "Announcement",
  type: "document",
  description: "Closures, events and reminders. The most important active one appears as a banner on every page.",
  fields: [
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Closure (weather, holiday, emergency)", value: "closure" },
          { title: "Urgent", value: "urgent" },
          { title: "Event", value: "event" },
          { title: "General update", value: "info" },
        ],
        layout: "radio",
      },
      initialValue: "info",
      validation: (r) => r.required(),
    }),
    defineField({ name: "title", title: "Headline", type: "localeString", description: "One short sentence, e.g. “STARS is closed today due to icy roads.”", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Details", type: "localeText", description: "Optional. Shown on the Current Families page." }),
    defineField({
      name: "startsAt",
      title: "Show from",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "endsAt",
      title: "Hide after",
      type: "datetime",
      description: "Leave empty to keep showing until you unpublish it.",
      validation: (r) =>
        r.custom((endsAt: string | undefined, ctx) => {
          const startsAt = (ctx.document as { startsAt?: string } | undefined)?.startsAt;
          if (endsAt && startsAt && Date.parse(endsAt) <= Date.parse(startsAt)) return "“Hide after” must be later than “Show from”.";
          if (!endsAt && (ctx.document as { kind?: string } | undefined)?.kind === "closure") {
            return { message: "Closures usually need an end time so the banner disappears on its own.", level: "warning" };
          }
          return true;
        }),
    }),
    defineField({ name: "showBanner", title: "Show as a banner on every page", type: "boolean", initialValue: true }),
    defineField({
      name: "sendText",
      title: "Also text families who signed up for alerts",
      type: "boolean",
      initialValue: false,
      description:
        "Sends once when you publish. Changing the text message and publishing again sends a correction. Only for closures and urgent notices.",
      hidden: ({ document }) => !["closure", "urgent"].includes(String((document as { kind?: string } | undefined)?.kind)),
    }),
    defineField({
      name: "textMessage",
      title: "Text message",
      type: "object",
      description: "Short and plain, e.g. “Closed today, Jan 9, due to icy roads. Vans will not run.” “STARS Academy:” and opt-out wording are added automatically.",
      hidden: ({ document }) => !(document as { sendText?: boolean } | undefined)?.sendText,
      fields: [
        defineField({
          name: "en",
          title: "English",
          type: "string",
          validation: (r) =>
            r.max(140).custom((v: string | undefined, ctx) => ((ctx.document as { sendText?: boolean } | undefined)?.sendText && !v ? "Write the text message, or untick “Also text families”." : true)),
        }),
        defineField({ name: "es", title: "Español", type: "string", validation: (r) => r.max(140) }),
      ],
    }),
    defineField({
      name: "link",
      title: "Link (optional)",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Link text", type: "localeString" }),
        defineField({
          name: "href",
          title: "Address",
          type: "string",
          description: "A page on this site (e.g. /families) or a full https:// address.",
          validation: (r) => r.custom((v: string | undefined) => (!v || SAFE_HREF.test(v) ? true : "Use https://…, tel:, mailto: or a site path like /families.")),
        }),
      ],
    }),
  ],
  orderings: [{ title: "Newest first", name: "startsDesc", by: [{ field: "startsAt", direction: "desc" }] }],
  preview: {
    select: { title: "title.en", kind: "kind", startsAt: "startsAt", endsAt: "endsAt" },
    prepare: ({ title, kind, startsAt, endsAt }) => ({
      title,
      subtitle: `${String(kind).toUpperCase()} · ${startsAt ? new Date(startsAt).toLocaleString() : ""}${endsAt ? ` → ${new Date(endsAt).toLocaleString()}` : ""}`,
    }),
  },
});
