import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../globals.css";
import { fraunces, figtree } from "../../fonts";

export const metadata: Metadata = {
  title: { default: "Website insights | STARS Academy", template: "%s | STARS Academy staff" },
  robots: { index: false, follow: false, nocache: true },
};

/** Root layout for staff-only pages: no site chrome, no analytics, never indexed. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US" className={`${fraunces.variable} ${figtree.variable}`}>
      <body className="bg-sand">
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
