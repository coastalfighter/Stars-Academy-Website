import { EventsView } from "@/views/EventsView";
import { communityCopy } from "@/content/copy/community";
import { pageMetadata } from "@/i18n/metadata";

const t = communityCopy.es.events;
export const metadata = pageMetadata("es", "events", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <EventsView locale="es" />;
}
