import { FaqView } from "@/views/FaqView";
import { faqCopy } from "@/content/copy/faq";
import { pageMetadata } from "@/i18n/metadata";

const t = faqCopy.en;
export const metadata = pageMetadata("en", "faq", { title: t.metaTitle, description: t.metaDescription });

export default function FaqPage() {
  return <FaqView locale="en" />;
}
