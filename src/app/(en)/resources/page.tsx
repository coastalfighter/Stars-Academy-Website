import { ResourcesView } from "@/views/ResourcesView";
import { communityCopy } from "@/content/copy/community";
import { pageMetadata } from "@/i18n/metadata";

const t = communityCopy.en.resources;
export const metadata = pageMetadata("en", "resources", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <ResourcesView locale="en" />;
}
