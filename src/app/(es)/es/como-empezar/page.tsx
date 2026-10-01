import { GettingStartedView } from "@/views/GettingStartedView";
import { gettingStartedCopy } from "@/content/copy/gettingStarted";
import { pageMetadata } from "@/i18n/metadata";

const t = gettingStartedCopy.es;
export const metadata = pageMetadata("es", "gettingStarted", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <GettingStartedView locale="es" />;
}
