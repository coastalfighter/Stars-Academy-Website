import { EnrollView } from "@/views/EnrollView";
import { enrollCopy } from "@/content/copy/enroll";
import { pageMetadata } from "@/i18n/metadata";

const t = enrollCopy.es;
export const metadata = pageMetadata("es", "enroll", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <EnrollView locale="es" />;
}
