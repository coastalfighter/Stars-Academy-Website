import type { ReactNode } from "react";
import "../globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { layoutMetadata } from "@/i18n/metadata";

export { viewport } from "@/i18n/metadata";
export const metadata = layoutMetadata("es");

/** Root layout for the Spanish site (<html lang="es-US">), served under /es. */
export default function SpanishLayout({ children }: { children: ReactNode }) {
  return <SiteShell locale="es">{children}</SiteShell>;
}
