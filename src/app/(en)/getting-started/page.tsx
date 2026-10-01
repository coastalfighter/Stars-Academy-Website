import { GettingStartedView } from "@/views/GettingStartedView";
import { gettingStartedCopy } from "@/content/copy/gettingStarted";
import { pageMetadata } from "@/i18n/metadata";

const t = gettingStartedCopy.en;
export const metadata = pageMetadata("en", "gettingStarted", { title: t.metaTitle, description: t.metaDescription });

export default function GettingStartedPage() {
  return <GettingStartedView locale="en" />;
}
