import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";
import { previewAction } from "./actions/previewAction";

const SINGLETONS = new Set(["siteSettings"]);
const HIDDEN = new Set(["siteSettings", "previewSecret"]);

export default defineConfig({
  name: "stars-academy",
  title: "STARS Academy",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "replace-me",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [
    structureTool({ structure }),
    // GROQ playground for developers only.
    ...(process.env.NODE_ENV === "development" ? [visionTool()] : []),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter((t) => !HIDDEN.has(t.schemaType)),
      {
        id: "faq-in-group",
        title: "FAQ",
        schemaType: "faq",
        parameters: [{ name: "group", type: "string" }],
        value: (params: { group: string }) => ({ group: params.group }),
      },
    ],
  },
  document: {
    // The contact-details singleton can't be duplicated or deleted.
    actions: (prev, ctx) => {
      const base = SINGLETONS.has(ctx.schemaType)
        ? prev.filter((a) => a.action && ["publish", "discardChanges", "restore"].includes(a.action))
        : prev;
      return [...base, previewAction];
    },
    newDocumentOptions: (prev) => prev.filter((item) => !HIDDEN.has(item.templateId)),
  },
});
