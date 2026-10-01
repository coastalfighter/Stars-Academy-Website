import { HomeView } from "@/views/HomeView";
import { alternates } from "@/i18n/routes";

export const metadata = { alternates: alternates("home", "es") };

export default function InicioPage() {
  return <HomeView locale="es" />;
}
