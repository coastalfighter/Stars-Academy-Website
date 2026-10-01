import { defineField, defineType } from "sanity";

/**
 * Short-lived secrets created by the Preview action. Stored under a private
 * ID path ("previewSecret.<random>"), which public dataset reads can't see.
 * Hidden from the Studio's navigation.
 */
export const previewSecret = defineType({
  name: "previewSecret",
  title: "Preview secret",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "secret", type: "string" }),
    defineField({ name: "expiresAt", type: "datetime" }),
  ],
});
