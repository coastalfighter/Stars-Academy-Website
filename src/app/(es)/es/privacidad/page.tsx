import { PrivacyView } from "@/views/LegalViews";
import { legalCopy } from "@/content/copy/legal";
import { pageMetadata } from "@/i18n/metadata";

const t = legalCopy.es.privacy;
export const metadata = pageMetadata("es", "privacy", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <PrivacyView locale="es" />;
}
