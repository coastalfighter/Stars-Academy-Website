import { TourView } from "@/views/TourView";
import { contactCopy } from "@/content/copy/contact";
import { pageMetadata } from "@/i18n/metadata";
import { formPresets, type SearchParams } from "@/lib/searchParams";

const t = contactCopy.es.tour;
export const metadata = pageMetadata("es", "tour", { title: t.metaTitle, description: t.metaDescription });

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { audience, reason } = await formPresets(searchParams);
  return <TourView locale="es" audience={audience ?? "family"} reason={reason ?? "tour"} />;
}
