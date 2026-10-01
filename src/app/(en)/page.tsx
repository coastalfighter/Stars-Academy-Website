import { HomeView } from "@/views/HomeView";
import { alternates } from "@/i18n/routes";

export const metadata = { alternates: alternates("home", "en") };

export default function HomePage() {
  return <HomeView locale="en" />;
}
