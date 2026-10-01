import type { ReactNode } from "react";
import "../globals.css";
import { SiteShell } from "@/components/layout/SiteShell";
import { layoutMetadata } from "@/i18n/metadata";

export { viewport } from "@/i18n/metadata";
export const metadata = layoutMetadata("en");

/** Root layout for the English site (<html lang="en-US">). */
export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
