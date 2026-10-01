import { AccessibilityView } from "@/views/LegalViews";
import { legalCopy } from "@/content/copy/legal";
import { pageMetadata } from "@/i18n/metadata";

const t = legalCopy.es.accessibility;
export const metadata = pageMetadata("es", "accessibility", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <AccessibilityView locale="es" />;
}
