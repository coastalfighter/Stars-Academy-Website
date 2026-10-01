import { FaqView } from "@/views/FaqView";
import { faqCopy } from "@/content/copy/faq";
import { pageMetadata } from "@/i18n/metadata";

const t = faqCopy.es;
export const metadata = pageMetadata("es", "faq", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <FaqView locale="es" />;
}
