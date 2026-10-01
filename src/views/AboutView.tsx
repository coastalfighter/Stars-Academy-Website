import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { href } from "@/i18n/routes";
import { getContent } from "@/content";
import { aboutCopy } from "@/content/copy/about";
import { communityCopy } from "@/content/copy/community";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { NextStep } from "@/components/page/NextStep";
import { ContactCard } from "@/components/page/ContactCard";
import { SouthCampusCard } from "@/components/cms/SouthCampusCard";
import { getSiteSettings, getTeam } from "@/cms/repository";
import { ButtonLink } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";

const LETTER_COLORS = ["text-gold-deep", "text-coral-deep", "text-teal-deep", "text-blue-deep", "text-berry-deep"] as const;

export async function AboutView({ locale }: { locale: Locale }) {
  const t = aboutCopy[locale];
  const d = getDictionary(locale);
  const { site, values, pages, photos } = getContent(locale);
  const [everyone, settings] = await Promise.all([getTeam(locale), getSiteSettings(locale)]);
  const team = everyone.filter((m) => m.group === "leadership");
  const socialClass =
    "inline-flex min-h-11 items-center rounded-full border border-ink/15 bg-white/70 px-5 text-sm font-semibold hover:border-ink/40";

  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.crumb, href: href(locale, "about") }]} eyebrow={t.eyebrow} title={t.title} lede={t.lede} />

      <Section tone="paper" labelledBy="story-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionIntro id="story-title" eyebrow={t.storyEyebrow} title={t.storyTitle} />
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
              {pages.aboutStory.map((p) => (
                <Reveal as="p" key={p}>
                  {p}
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
              <Image
                src={photos.storyTime.src}
                alt={photos.storyTime.alt}
                width={photos.storyTime.width}
                height={photos.storyTime.height}
                sizes="(min-width: 1024px) 400px, 90vw"
                className="h-auto w-full"
              />
            </div>
          </Reveal>
        </div>

        <dl className="mt-16 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {site.stats.map((s) => (
            <div key={s.label} className="bg-paper p-7">
              <dt className="text-sm text-muted">{s.label}</dt>
              <dd className="mt-2 font-display text-5xl text-teal-deep tabular-nums">
                <CountUp value={s.value} />
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section labelledBy="name-title">
        <SectionIntro id="name-title" eyebrow={t.nameEyebrow} title={t.nameTitle} lede={t.nameLede} align="center" />
        {/* The acronym is the organization's English name. */}
        <Reveal as="ol" className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-5">
          {site.acronym.map((word, i) => (
            <li key={word} lang="en-US" className="card flex flex-col items-center gap-2 p-6 text-center">
              <span aria-hidden="true" className={`font-display text-6xl leading-none ${LETTER_COLORS[i]}`}>
                {word[0]}
              </span>
              <span className="font-display text-xl">{word}</span>
            </li>
          ))}
        </Reveal>
        {site.acronymMeaning ? (
          <p className="mt-8 text-center font-display text-2xl text-ink-soft">“{site.acronymMeaning}”</p>
        ) : null}
      </Section>

      <Section tone="ink" labelledBy="vision-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro id="vision-title" tone="ink" eyebrow={t.visionEyebrow} title={t.visionTitle} />
          </div>
          <Reveal as="p" className="font-display text-2xl leading-snug text-cream/90 lg:col-span-7 lg:text-3xl">
            {pages.aboutVision}
          </Reveal>
        </div>
        <div className="mt-16">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cream/60">{t.valuesTitle}</h3>
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {values.map((v, i) => (
              <Reveal as="li" key={v.name} delay={i * 60} className="rounded-2xl border border-cream/10 p-5">
                <p className="font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 font-display text-xl text-cream">{v.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{v.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {team.length > 0 ? (
        <Section tone="paper" labelledBy="leadership-title">
          <SectionIntro id="leadership-title" eyebrow={d.cms.leadershipEyebrow} title={d.cms.leadershipTitle} />
          <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <Reveal as="li" key={m.id} className="card p-7">
                <p className="font-display text-2xl">
                  {m.name}
                  {m.credentials ? <span className="text-lg text-muted">, {m.credentials}</span> : null}
                </p>
                <p className="mt-1 font-semibold text-teal-deep" lang={m.role.lang}>
                  {m.role.text}
                </p>
                {m.bio ? (
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft" lang={m.bio.lang}>
                    {m.bio.text}
                  </p>
                ) : null}
              </Reveal>
            ))}
          </ul>
          <ButtonLink href={href(locale, "team")} variant="ghost" className="mt-8" arrow>
            {communityCopy[locale].team.peopleTitle}
          </ButtonLink>
        </Section>
      ) : null}

      <Section labelledBy="facilities-title">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionIntro id="facilities-title" eyebrow={t.facilitiesEyebrow} title={t.facilitiesTitle} lede={t.facilitiesLede} />
          <div className="space-y-4">
            <ContactCard locale={locale} />
            {settings.southCampus ? <SouthCampusCard campus={settings.southCampus} locale={locale} /> : null}
            <div className="flex flex-wrap gap-3">
              <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" className={socialClass}>
                {t.facebook}
                <span className="sr-only">{d.common.opensNewTab}</span>
              </a>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className={socialClass}>
                {t.instagram}
                <span className="sr-only">{d.common.opensNewTab}</span>
              </a>
            </div>
          </div>
        </div>
      </Section>

      <NextStep
        locale={locale}
        title={t.nextTitle}
        body={t.nextBody}
        actions={
          <ButtonLink href={href(locale, "tour")} variant="secondary" size="lg" arrow>
            {t.nextTour}
          </ButtonLink>
        }
        related={[
          { ...t.related[0]!, href: href(locale, "careers") },
          { ...t.related[1]!, href: href(locale, "approach") },
        ]}
      />
    </>
  );
}
