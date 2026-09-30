import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { site } from "@/content/site";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd, organizationSchema } from "@/components/seo/JsonLd";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "STARS Academy | Pediatric Therapy & Developmental Preschool in Batesville, AR",
    template: "%s | STARS Academy",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "pediatric therapy Batesville",
    "developmental preschool Arkansas",
    "speech therapy for children",
    "occupational therapy",
    "physical therapy",
    "pediatric nursing",
    "developmental day treatment",
    "ARKids First-A",
    "TEFRA",
  ],
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: site.url,
    title: "STARS Academy — therapy, learning and care in one full day",
    description: site.description,
    images: [{ url: "/photos/classroom-play.webp", width: 1200, height: 801, alt: "Preschoolers and teachers playing together on a classroom rug." }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: true, address: true },
};

export const viewport: Viewport = {
  themeColor: "#fbf7ef",
  width: "device-width",
  initialScale: 1,
};

/**
 * Runs before paint: marks JS as available (enables reveal animations) and
 * applies the stored calm-mode choice so there's no flash of motion.
 */
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var s=localStorage.getItem('stars:calm-mode');var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.calm=String(s===null?r:s==='true');}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US" className={`${fraunces.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream"
        >
          Skip to main content
        </a>
        <MotionProvider>
          <SmoothScroll />
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
        </MotionProvider>
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
