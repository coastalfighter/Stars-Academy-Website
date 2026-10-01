import { FamiliesView } from "@/views/FamiliesView";
import { familiesCopy } from "@/content/copy/families";
import { pageMetadata } from "@/i18n/metadata";

const t = familiesCopy.es;
export const metadata = pageMetadata("es", "families", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <FamiliesView locale="es" />;
}
