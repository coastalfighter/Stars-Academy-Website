import { AboutView } from "@/views/AboutView";
import { aboutCopy } from "@/content/copy/about";
import { pageMetadata } from "@/i18n/metadata";

const t = aboutCopy.es;
export const metadata = pageMetadata("es", "about", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <AboutView locale="es" />;
}
