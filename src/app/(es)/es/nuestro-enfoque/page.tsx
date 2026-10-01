import { ApproachView } from "@/views/ApproachView";
import { approachCopy } from "@/content/copy/approach";
import { pageMetadata } from "@/i18n/metadata";

const t = approachCopy.es;
export const metadata = pageMetadata("es", "approach", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <ApproachView locale="es" />;
}
