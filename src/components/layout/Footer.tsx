import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { href, serviceHref } from "@/i18n/routes";
import { getContent } from "@/content";
import { StarMark } from "@/components/ui/StarMark";

export function Footer({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const { site, services, nondiscriminationSummary } = getContent(locale);
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 bg-ink text-cream/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link href={href(locale, "home")} className="flex items-center gap-3">
            <StarMark className="h-11 w-11" />
            <span className="font-display text-2xl font-semibold text-cream">STARS Academy</span>
          </Link>
          <p className="mt-5 max-w-sm leading-relaxed">
            {site.tagline} {d.footer.since} {site.founded}.
          </p>
          <p className="mt-6 flex flex-wrap gap-x-1 font-display text-lg text-cream">
            {site.acronym.map((word) => (
              <span key={word}>
                <span className="text-gold">{word[0]}</span>
                {word.slice(1)}
              </span>
            ))}
          </p>
          {site.acronymMeaning ? <p className="mt-1 text-sm text-cream/60">{site.acronymMeaning}</p> : null}
        </div>

        <div className="md:col-span-3">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold">{d.footer.visitOrCall}</h2>
          <address className="mt-4 not-italic leading-relaxed">
            <span className="font-semibold text-cream">STARS Academy</span>
            <br />
            <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}
              <span className="sr-only">{d.common.opensMaps}</span>
            </a>
            <br />
            <a href={site.phone.href} className="mt-3 inline-block font-semibold text-cream underline-offset-4 hover:underline">
              {site.phone.display}
            </a>
            <br />
            <span>{site.hours.display}</span>
          </address>
        </div>

        <nav aria-label={d.footer.services} className="md:col-span-2">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold">{d.footer.services}</h2>
          <ul className="mt-4 space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={serviceHref(locale, s.slug)} className="underline-offset-4 hover:text-cream hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={d.footer.forYou} className="md:col-span-3">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold">{d.footer.forYou}</h2>
          <ul className="mt-4 space-y-2">
            {d.footer.forYouLinks.map((l) => (
              <li key={l.key}>
                <Link className="underline-offset-4 hover:text-cream hover:underline" href={href(locale, l.key)}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-wrap gap-3">
            <li>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-cream/20 px-4 text-sm hover:border-cream/50">
                Facebook<span className="sr-only">{d.common.opensNewTab}</span>
              </a>
            </li>
            <li>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-cream/20 px-4 text-sm hover:border-cream/50">
                Instagram<span className="sr-only">{d.common.opensNewTab}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col gap-4 py-8 text-sm text-cream/65">
          <p className="max-w-4xl leading-relaxed">
            {nondiscriminationSummary}{" "}
            <Link href={href(locale, "nondiscrimination")} className="text-cream underline underline-offset-4">
              {d.footer.readNondiscrimination}
            </Link>
            .
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {site.legalName}. {d.footer.registeredMark}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {d.footer.legal.map((l) => (
                <li key={l.key}>
                  <Link href={href(locale, l.key)} className="underline-offset-4 hover:text-cream hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
