import { ServicesView } from "@/views/ServicesView";
import { servicesCopy } from "@/content/copy/services";
import { pageMetadata } from "@/i18n/metadata";

const t = servicesCopy.es.index;
export const metadata = pageMetadata("es", "services", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <ServicesView locale="es" />;
}
