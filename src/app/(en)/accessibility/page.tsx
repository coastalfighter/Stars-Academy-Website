import { AccessibilityView } from "@/views/LegalViews";
import { legalCopy } from "@/content/copy/legal";
import { pageMetadata } from "@/i18n/metadata";

const t = legalCopy.en.accessibility;
export const metadata = pageMetadata("en", "accessibility", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <AccessibilityView locale="en" />;
}
