import type { Metadata } from "next";
import "./globals.css";
import { fraunces, figtree } from "./fonts";
import { getDictionary } from "@/i18n/dictionary";
import { href } from "@/i18n/routes";
import { site } from "@/content/site";
import Link from "next/link";
import { StarMark } from "@/components/ui/StarMark";

export const metadata: Metadata = {
  title: "Page not found · Página no encontrada | STARS Academy",
  robots: { index: false },
};

/**
 * 404 for URLs that match no route at all. With one root layout per language
 * there is no shared layout to render inside, so this page is bilingual and
 * self-contained.
 */
export default function GlobalNotFound() {
  const en = getDictionary("en").notFound;
  const es = getDictionary("es").notFound;
  const button =
    "inline-flex min-h-13 items-center justify-center rounded-full bg-ink px-7 font-semibold text-cream hover:bg-ink-soft";
  return (
    <html lang="en-US" className={`${fraunces.variable} ${figtree.variable}`}>
      <body>
        <main className="container-x flex min-h-screen flex-col items-center justify-center gap-14 py-20 text-center">
          <Link href="/" aria-label={site.name}>
            <StarMark className="h-16 w-16" />
          </Link>
          <section className="max-w-xl">
            <h1 className="display-md">{en.title}</h1>
            <p className="lede mt-3">
              {en.body}{" "}
              <a href={site.phone.href} className="whitespace-nowrap font-semibold text-ink underline underline-offset-4">
                {site.phone.display}
              </a>
            </p>
            <Link href={href("en", "home")} className={`${button} mt-6`}>
              {en.home}
            </Link>
          </section>
          <section lang="es-US" className="max-w-xl border-t border-line pt-14">
            <h2 className="display-md">{es.title}</h2>
            <p className="lede mt-3">
              {es.body}{" "}
              <a href={site.phone.href} className="whitespace-nowrap font-semibold text-ink underline underline-offset-4">
                {site.phone.display}
              </a>
            </p>
            <Link href={href("es", "home")} className={`${button} mt-6`}>
              {es.home}
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
