import { ResourcesView } from "@/views/ResourcesView";
import { communityCopy } from "@/content/copy/community";
import { pageMetadata } from "@/i18n/metadata";

const t = communityCopy.es.resources;
export const metadata = pageMetadata("es", "resources", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <ResourcesView locale="es" />;
}
