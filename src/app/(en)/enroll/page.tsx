import { EnrollView } from "@/views/EnrollView";
import { enrollCopy } from "@/content/copy/enroll";
import { pageMetadata } from "@/i18n/metadata";

const t = enrollCopy.en;
export const metadata = pageMetadata("en", "enroll", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <EnrollView locale="en" />;
}
