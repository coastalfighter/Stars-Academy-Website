import { PhotosView } from "@/views/PhotosView";
import { communityCopy } from "@/content/copy/community";
import { pageMetadata } from "@/i18n/metadata";

const t = communityCopy.en.photos;
export const metadata = pageMetadata("en", "photos", { title: t.metaTitle, description: t.metaDescription });

export default function Page() {
  return <PhotosView locale="en" />;
}
