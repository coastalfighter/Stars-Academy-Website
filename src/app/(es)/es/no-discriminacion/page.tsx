import { NondiscriminationView } from "@/views/LegalViews";
import { legalCopy } from "@/content/copy/legal";
import { pageMetadata } from "@/i18n/metadata";

const t = legalCopy.es.nondiscrimination;
export const metadata = pageMetadata("es", "nondiscrimination", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <NondiscriminationView locale="es" />;
}
