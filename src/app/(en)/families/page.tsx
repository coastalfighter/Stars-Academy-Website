import { FamiliesView } from "@/views/FamiliesView";
import { familiesCopy } from "@/content/copy/families";
import { pageMetadata } from "@/i18n/metadata";

const t = familiesCopy.en;
export const metadata = pageMetadata("en", "families", { title: t.metaTitle, description: t.metaDescription });

export default function FamiliesPage() {
  return <FamiliesView locale="en" />;
}
