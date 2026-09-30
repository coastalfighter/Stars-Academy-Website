import Image from "next/image";
import { site } from "@/content/site";
import { photos } from "@/content/photos";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Visit() {
  return (
    <section aria-labelledby="visit-title" className="relative flex min-h-[110vh] items-center py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[60%] bg-gradient-to-r from-cream via-cream/75 to-transparent lg:block"
      />
      <div className="container-x relative">
        <div className="over-scene copy-col">
          <Reveal>
            <p className="eyebrow">Come see for yourself</p>
            <h2 id="visit-title" className="display-lg mt-5">
              The best way to understand STARS is to <span className="text-teal-deep">walk through the door.</span>
            </h2>
            <p className="lede mt-5">
              Tours are relaxed and there’s no commitment. You’ll see the classrooms and therapy spaces, meet our team
              and get your questions answered.
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
                className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4"
              >
                {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}
                <span className="sr-only"> (opens Google Maps in a new tab)</span>
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
            <ButtonLink href="/schedule-a-tour" size="lg" arrow>
              Schedule a tour
            </ButtonLink>
            <ButtonLink href={site.phone.href} size="lg" variant="ghost">
              Call us
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
