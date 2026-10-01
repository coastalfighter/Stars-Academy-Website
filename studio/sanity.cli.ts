import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "replace-me",
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  // Hosted free by Sanity at https://stars-academy.sanity.studio after `npm run deploy`.
  studioHost: "stars-academy",
});
