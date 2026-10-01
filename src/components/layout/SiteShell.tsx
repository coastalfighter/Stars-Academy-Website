import type { ReactNode } from "react";
import { fraunces, figtree } from "@/app/fonts";
import { HTML_LANG, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { JsonLd, organizationSchema } from "@/components/seo/JsonLd";

/**
 * Runs before paint: marks JS as available (enables reveal animations) and
 * applies the stored calm-mode choice so there's no flash of motion.
 */
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var s=localStorage.getItem('stars:calm-mode');var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.dataset.calm=String(s===null?r:s==='true');}catch(e){}})();`;

/**
 * The full HTML document for one language. Each language has its own root
 * layout (route groups), so <html lang> is correct in the server-rendered
 * HTML — required for WCAG 3.1.1 and for screen-reader pronunciation.
 */
export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const d = getDictionary(locale);
  return (
    <html lang={HTML_LANG[locale]} className={`${fraunces.variable} ${figtree.variable}`} suppressHydrationWarning>
      {/* App Router root layouts render <head> directly; the rule targets the Pages Router. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream"
        >
          {d.common.skipToMain}
        </a>
        <MotionProvider>
          <SmoothScroll />
          <Header locale={locale} />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer locale={locale} />
        </MotionProvider>
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
