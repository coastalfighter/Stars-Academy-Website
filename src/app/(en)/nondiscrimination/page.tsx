import { NondiscriminationView } from "@/views/LegalViews";
import { legalCopy } from "@/content/copy/legal";
import { pageMetadata } from "@/i18n/metadata";

const t = legalCopy.en.nondiscrimination;
export const metadata = pageMetadata("en", "nondiscrimination", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <NondiscriminationView locale="en" />;
}
