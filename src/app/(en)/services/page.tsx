import { ServicesView } from "@/views/ServicesView";
import { servicesCopy } from "@/content/copy/services";
import { pageMetadata } from "@/i18n/metadata";

const t = servicesCopy.en.index;
export const metadata = pageMetadata("en", "services", { title: t.metaTitle, description: t.metaDescription });

export default function ServicesPage() {
  return <ServicesView locale="en" />;
}
