import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import type { SiteSettings } from "@/cms/repository";

/** STARS Academy South — appears once the address is entered in the CMS. */
export function SouthCampusCard({ campus, locale }: { campus: NonNullable<SiteSettings["southCampus"]>; locale: Locale }) {
  const d = getDictionary(locale);
  const query = encodeURIComponent(`${campus.street}, ${campus.city}, ${campus.region} ${campus.postalCode}`);
  return (
    <address className="card p-6 not-italic leading-relaxed">
      <strong className="font-display text-lg">{d.cms.southCampus}</strong>
      <br />
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4"
      >
        {campus.street}, {campus.city}, {campus.region} {campus.postalCode}
        <span className="sr-only">{d.common.opensMaps}</span>
      </a>
      {campus.note ? (
        <>
          <br />
          <span className="text-ink-soft" lang={campus.note.lang}>
            {campus.note.text}
          </span>
        </>
      ) : null}
    </address>
  );
}
