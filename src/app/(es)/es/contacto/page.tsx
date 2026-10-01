import { ContactView } from "@/views/ContactView";
import { contactCopy } from "@/content/copy/contact";
import { pageMetadata } from "@/i18n/metadata";
import { formPresets, type SearchParams } from "@/lib/searchParams";

const t = contactCopy.es.contact;
export const metadata = pageMetadata("es", "contact", { title: t.metaTitle, description: t.metaDescription });

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  return <ContactView locale="es" {...await formPresets(searchParams)} />;
}
