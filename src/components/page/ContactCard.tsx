import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { getContent } from "@/content";

/** Address, hours and phone — used on contact-oriented pages. */
export function ContactCard({ className = "", locale = "en" }: { className?: string; locale?: Locale }) {
  const { site } = getContent(locale);
  const d = getDictionary(locale);
  return (
    <address className={`card p-6 not-italic leading-relaxed ${className}`}>
      <strong className="font-display text-lg">{site.name}</strong>
      <br />
      <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
        {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}
        <span className="sr-only">{d.common.opensMaps}</span>
      </a>
      <br />
      {site.hours.display}
      <br />
      <a href={site.phone.href} className="font-semibold">
        {site.phone.display}
      </a>
    </address>
  );
}
