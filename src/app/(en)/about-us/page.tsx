import { AboutView } from "@/views/AboutView";
import { aboutCopy } from "@/content/copy/about";
import { pageMetadata } from "@/i18n/metadata";

const t = aboutCopy.en;
export const metadata = pageMetadata("en", "about", { title: t.metaTitle, description: t.metaDescription });

export default function AboutPage() {
  return <AboutView locale="en" />;
}
