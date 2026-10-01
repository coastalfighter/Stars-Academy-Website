import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getContent } from "@/content";
import { contactCopy } from "@/content/copy/contact";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { ContactCard } from "@/components/page/ContactCard";
import { CheckIcon } from "@/components/page/Lists";
import type { Audience, Reason } from "@/lib/validation/inquiry";

export function TourView({ locale, audience, reason }: { locale: Locale; audience: Audience; reason: Reason }) {
  const t = contactCopy[locale].tour;
  const { photos } = getContent(locale);

  return (
    <div className="relative overflow-hidden pt-36 pb-24 md:pt-44">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-32 h-[36rem] w-[36rem] rounded-full bg-accent/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/2 h-[30rem] w-[30rem] rounded-full bg-teal/10 blur-3xl" />

      <div className="container-x relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="display-lg mt-5">{t.title}</h1>
          <p className="lede mt-5">{t.lede}</p>

          <ul className="mt-8 space-y-3">
            {t.expect.map((item) => (
              <li key={item} className="flex gap-3">
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={photos.classroomPlay.src}
              alt={photos.classroomPlay.alt}
              width={photos.classroomPlay.width}
              height={photos.classroomPlay.height}
              sizes="(min-width: 1024px) 480px, 100vw"
              className="h-auto w-full"
              priority
            />
          </div>

          <ContactCard locale={locale} className="mt-8" />
        </div>

        <div className="lg:col-span-7">
          <InquiryForm locale={locale} defaultAudience={audience} defaultReason={reason} />
        </div>
      </div>
    </div>
  );
}
