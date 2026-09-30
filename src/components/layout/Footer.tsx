import Link from "next/link";
import { nondiscriminationSummary, site } from "@/content/site";
import { services } from "@/content/services";
import { StarMark } from "@/components/ui/StarMark";

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
            <li><Link className="underline-offset-4 hover:text-cream hover:underline" href="/#eligibility">Is STARS right for my child?</Link></li>
            <li><Link className="underline-offset-4 hover:text-cream hover:underline" href="/schedule-a-tour">Schedule a tour</Link></li>
            <li><Link className="underline-offset-4 hover:text-cream hover:underline" href="/#referrals">For referral partners</Link></li>
            <li><Link className="underline-offset-4 hover:text-cream hover:underline" href="/#careers">Careers</Link></li>
            <li><Link className="underline-offset-4 hover:text-cream hover:underline" href="/#approach">Our approach</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col gap-4 py-8 text-sm text-cream/65">
          <p className="max-w-4xl leading-relaxed">{nondiscriminationSummary}</p>
          <p>
            © {year} {site.legalName}. STARS Academy® is a registered mark.
          </p>
        </div>
      </div>
    </footer>
  );
}
