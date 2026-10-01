import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/routes";
import { getContent } from "@/content";
import { homeCopy } from "@/content/copy/home";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Careers({ locale }: { locale: Locale }) {
  const t = homeCopy[locale].careers;
  const { careerRoles, photos } = getContent(locale);
  const toEnglish = locale === "en" ? undefined : "en-US";
  return (
    <section id="careers" aria-labelledby="careers-title" className="relative z-10 scroll-mt-24 bg-ink py-28 text-cream lg:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow !text-accent">{t.eyebrow}</p>
            <h2 id="careers-title" className="display-lg mt-5">
              {t.titleA} <span className="text-accent">{t.titleB}</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-cream/75">
              {t.lede}
            </p>
          </Reveal>
          <ul className="mt-10 space-y-5">
            {t.why.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 80} className="border-l-2 border-accent/60 pl-5">
                <h3 className="font-display text-xl">{w.title}</h3>
                <p className="mt-1.5 leading-relaxed text-cream/70">{w.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <Reveal className="overflow-hidden rounded-[var(--radius-card)]">
            <Image
              src={photos.ballPit.src}
              alt={photos.ballPit.alt}
              width={photos.ballPit.width}
              height={photos.ballPit.height}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
          <h3 className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-cream/60">{t.rolesTitle}</h3>
          <ul className="mt-4 divide-y divide-cream/10 rounded-[var(--radius-card)] border border-cream/10">
            {careerRoles.map((r) => (
              <li key={r.title} className="flex flex-col gap-1 p-5">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{r.team}</span>
                <span className="font-display text-lg">{r.title}</span>
                <span className="text-sm text-cream/65">{r.requirement}</span>
              </li>
            ))}
          </ul>
          <Reveal className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href={href(locale, "apply")} hrefLang={toEnglish} variant="secondary" size="lg" arrow>
                {t.apply}
              </ButtonLink>
              <ButtonLink href={href(locale, "careers")} hrefLang={toEnglish} variant="light" size="lg">
                {t.explore}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
