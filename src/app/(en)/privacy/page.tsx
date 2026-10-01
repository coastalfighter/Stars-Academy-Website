import { PrivacyView } from "@/views/LegalViews";
import { legalCopy } from "@/content/copy/legal";
import { pageMetadata } from "@/i18n/metadata";

const t = legalCopy.en.privacy;
export const metadata = pageMetadata("en", "privacy", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <PrivacyView locale="en" />;
}
