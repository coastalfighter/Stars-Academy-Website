import Link from "next/link";
import { nondiscriminationSummary, site } from "@/content/site";
import { services } from "@/content/services";
import { StarMark } from "@/components/ui/StarMark";

const FOR_YOU = [
  { label: "Is STARS right for my child?", href: "/getting-started" },
  { label: "Schedule a tour", href: "/schedule-a-tour" },
  { label: "Current families", href: "/families" },
  { label: "Frequently asked questions", href: "/faq" },
  { label: "For referral partners", href: "/referrals" },
  { label: "Careers", href: "/careers" },
  { label: "Our approach", href: "/approach" },
  { label: "About STARS", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
] as const;

const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Nondiscrimination statement", href: "/nondiscrimination" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 bg-ink text-cream/80">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link href="/" className="flex items-center gap-3">
            <StarMark className="h-11 w-11" />
            <span className="font-display text-2xl font-semibold text-cream">STARS Academy</span>
          </Link>
          <p className="mt-5 max-w-sm leading-relaxed">
            {site.tagline} In Batesville since {site.founded}.
          </p>
          <p className="mt-6 flex flex-wrap gap-x-1 font-display text-lg text-cream">
            {site.acronym.map((word) => (
              <span key={word}>
                <span className="text-gold">{word[0]}</span>
                {word.slice(1)}
              </span>
            ))}
          </p>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold">Visit or call</h2>
          <address className="mt-4 not-italic leading-relaxed">
            <span className="font-semibold text-cream">STARS Academy</span>
            <br />
            <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
            <br />
            <a href={site.phone.href} className="mt-3 inline-block font-semibold text-cream underline-offset-4 hover:underline">
              {site.phone.display}
            </a>
            <br />
            <span>{site.hours.display}</span>
          </address>
        </div>

        <nav aria-label="Services" className="md:col-span-2">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold">Services</h2>
          <ul className="mt-4 space-y-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="underline-offset-4 hover:text-cream hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="For you" className="md:col-span-3">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold">For you</h2>
          <ul className="mt-4 space-y-2">
            {FOR_YOU.map((l) => (
              <li key={l.href}>
                <Link className="underline-offset-4 hover:text-cream hover:underline" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex gap-3">
            <li>
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-cream/20 px-4 text-sm hover:border-cream/50">
                Facebook<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-cream/20 px-4 text-sm hover:border-cream/50">
                Instagram<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col gap-4 py-8 text-sm text-cream/65">
          <p className="max-w-4xl leading-relaxed">
            {nondiscriminationSummary}{" "}
            <Link href="/nondiscrimination" className="text-cream underline underline-offset-4">
              Read the full nondiscrimination statement
            </Link>
            .
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {site.legalName}. STARS Academy® is a registered mark.
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="underline-offset-4 hover:text-cream hover:underline">
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
