import { ContactView } from "@/views/ContactView";
import { contactCopy } from "@/content/copy/contact";
import { pageMetadata } from "@/i18n/metadata";
import { formPresets, type SearchParams } from "@/lib/searchParams";

const t = contactCopy.en.contact;
export const metadata = pageMetadata("en", "contact", { title: t.metaTitle, description: t.metaDescription });

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  return <ContactView locale="en" {...await formPresets(searchParams)} />;
}
