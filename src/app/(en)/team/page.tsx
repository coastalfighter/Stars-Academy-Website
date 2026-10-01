import { TeamView } from "@/views/TeamView";
import { communityCopy } from "@/content/copy/community";
import { pageMetadata } from "@/i18n/metadata";

const t = communityCopy.en.team;
export const metadata = pageMetadata("en", "team", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <TeamView locale="en" />;
}
