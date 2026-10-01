import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { href } from "@/i18n/routes";
import { getContent } from "@/content";
import { homeCopy } from "@/content/copy/home";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Visit({ locale }: { locale: Locale }) {
  const t = homeCopy[locale].visit;
  const d = getDictionary(locale);
  const { site, photos } = getContent(locale);
  return (
    <section aria-labelledby="visit-title" className="relative flex min-h-[110vh] items-center py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[60%] bg-gradient-to-r from-base via-base/75 to-transparent lg:block"
      />
      <div className="container-x relative">
        <div className="over-scene copy-col">
          <Reveal>
            <p className="eyebrow">{t.eyebrow}</p>
            <h2 id="visit-title" className="display-lg mt-5">
              {t.titleA} <span className="text-teal-deep">{t.titleB}</span>
            </h2>
            <p className="lede mt-5">
              {t.lede}
            </p>
          </Reveal>

          <Reveal className="mt-8 flex items-center gap-5">
            <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-2xl shadow-[var(--shadow-soft)]">
              <Image src={photos.classroomPlay.src} alt={photos.classroomPlay.alt} fill sizes="144px" className="object-cover" />
            </div>
            <address className="not-italic leading-relaxed text-ink-soft">
              <a
                href={site.address.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4"
              >
                {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}
                <span className="sr-only">{d.common.opensMaps}</span>
              </a>
              <br />
              {site.hours.display}
              <br />
              <a href={site.phone.href} className="font-semibold text-ink">
                {site.phone.display}
              </a>
            </address>
          </Reveal>

          <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={href(locale, "tour")} size="lg" arrow>
              {t.cta}
            </ButtonLink>
            <ButtonLink href={site.phone.href} size="lg" variant="ghost">
              {t.call}
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
