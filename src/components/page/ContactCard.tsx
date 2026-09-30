import { site } from "@/content/site";

/** Address, hours and phone — used on contact-oriented pages. */
export function ContactCard({ className = "" }: { className?: string }) {
  return (
    <address className={`card p-6 not-italic leading-relaxed ${className}`}>
      <strong className="font-display text-lg">{site.name}</strong>
      <br />
      <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
        {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}
        <span className="sr-only"> (opens Google Maps in a new tab)</span>
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
