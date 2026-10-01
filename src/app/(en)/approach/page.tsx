import { ApproachView } from "@/views/ApproachView";
import { approachCopy } from "@/content/copy/approach";
import { pageMetadata } from "@/i18n/metadata";

const t = approachCopy.en;
export const metadata = pageMetadata("en", "approach", { title: t.metaTitle, description: t.metaDescription });

export default function ApproachPage() {
  return <ApproachView locale="en" />;
}
