import { defineField, defineType } from "sanity";

export const galleryPhoto = defineType({
  name: "galleryPhoto",
  title: "Gallery photo",
  type: "document",
  description:
    "Photos for the website gallery. Any photo showing a child needs a signed photo release from the parent or guardian on file. Don’t show name tags, cubbies with names, medical equipment that identifies a child, or anything that reveals a diagnosis.",
  fields: [
    defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true }, validation: (r) => r.required() }),
    defineField({
      name: "consentOnFile",
      title: "Signed photo release is on file for everyone identifiable in this photo",
      type: "boolean",
      initialValue: false,
      validation: (r) => r.required().custom((v: boolean | undefined) => (v === true ? true : "Gallery photos can’t be published without a signed photo release on file.")),
    }),
    defineField({ name: "releaseDate", title: "Date the release was signed", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "alt",
      title: "Description for people who can’t see the photo",
      type: "localeString",
      description: "Describe what’s happening, e.g. “A therapist and a toddler stack blocks on a classroom table.” No names.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "caption", title: "Caption (optional)", type: "localeString" }),
    defineField({
      name: "topic",
      title: "Topic",
      type: "string",
      options: {
        list: [
          { title: "Classrooms", value: "classrooms" },
          { title: "Therapy", value: "therapy" },
          { title: "Outdoors & play", value: "outdoors" },
          { title: "Events", value: "events" },
          { title: "Our campus", value: "campus" },
        ],
      },
      initialValue: "classrooms",
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 100 }),
  ],
  preview: { select: { title: "alt.en", subtitle: "topic", media: "image" } },
});
