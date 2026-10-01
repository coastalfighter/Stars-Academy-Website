import type { CSSProperties, ReactNode } from "react";
import { draftMode } from "next/headers";
import { fraunces, figtree } from "@/app/fonts";
import { HTML_LANG, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { JsonLd, organizationSchema } from "@/components/seo/JsonLd";
import { DraftModeBar } from "@/components/cms/DraftModeBar";
import { getAnnouncements } from "@/cms/repository";

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
export async function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const d = getDictionary(locale);
  const [announcements, draft] = await Promise.all([getAnnouncements(locale), draftMode()]);
  const banner = announcements.find((a) => a.banner) ?? null;
  // Server-side estimate of the banner height (its 44px close button + padding) so content doesn't jump
  // before the banner measures itself in the browser.
  const htmlStyle = banner ? ({ "--announce-h": "4rem" } as CSSProperties) : undefined;
  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${fraunces.variable} ${figtree.variable}`}
      style={htmlStyle}
      suppressHydrationWarning
    >
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
          <Header locale={locale} announcement={banner} />
          <main id="main" tabIndex={-1} className="outline-none" style={{ paddingTop: "var(--announce-h, 0px)" }}>
            {children}
          </main>
          <Footer locale={locale} />
          {draft.isEnabled ? <DraftModeBar locale={locale} /> : null}
        </MotionProvider>
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
