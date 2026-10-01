import { EventsView } from "@/views/EventsView";
import { communityCopy } from "@/content/copy/community";
import { pageMetadata } from "@/i18n/metadata";

const t = communityCopy.en.events;
export const metadata = pageMetadata("en", "events", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <EventsView locale="en" />;
}
