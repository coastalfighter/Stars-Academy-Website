import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { hasLocale, href } from "@/i18n/routes";
import { getContent } from "@/content";
import { approachCopy } from "@/content/copy/approach";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { CheckList } from "@/components/page/Lists";
import { NextStep } from "@/components/page/NextStep";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const ACCENTS = ["#f2c230", "#e8735a", "#2f8f8a", "#4f86c6", "#c4323a", "#9a6f00"] as const;

export function ApproachView({ locale }: { locale: Locale }) {
  const t = approachCopy[locale];
  const d = getDictionary(locale);
  const { pages, photos } = getContent(locale);

  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ label: t.crumb, href: href(locale, "approach") }]}
        eyebrow={t.eyebrow}
        title={t.title}
        lede={t.lede}
        accent="#2f8f8a"
      >
        <Reveal className="glass mt-10 max-w-3xl p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{t.inShort}</p>
          <p className="mt-2 font-display text-xl leading-snug sm:text-2xl">
            {t.shortA} <span className="text-teal-deep">{t.shortConnection}</span>
            {t.shortB} <span className="text-teal-deep">{t.shortCalm}</span>
            {t.shortC}
          </p>
        </Reveal>
      </PageHero>

      <Section tone="paper" labelledBy="pillars-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(8rem+var(--announce-h,0px))]">
              <SectionIntro id="pillars-title" eyebrow={t.pillarsEyebrow} title={t.pillarsTitle} />
              <nav aria-label={t.topicsLabel} className="mt-8">
                <ol className="space-y-1">
                  {pages.approachPillars.map((p, i) => (
                    <li key={p.id}>
                      <a
                        href={`#${p.id}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 font-semibold text-ink-soft transition-colors hover:bg-cream hover:text-ink"
                      >
                        <span className="w-6 text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                        {p.name}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-8">
            {pages.approachPillars.map((p, i) => (
              <Reveal as="section" key={p.id} className="card scroll-mt-28 p-7 sm:p-10">
                <div id={p.id} className="scroll-mt-28">
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="h-3 w-3 rotate-45 rounded-[3px]" style={{ background: ACCENTS[i] }} />
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-muted">
                      <span className="sr-only">{i + 1}. </span>
                      {p.name}
                    </p>
                  </div>
                  <h3 className="mt-4 font-display text-3xl leading-tight">{p.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-ink-soft">{p.body}</p>
                  <div className="mt-6 rounded-2xl bg-cream p-5">
                    <p className="text-sm font-bold text-ink">{t.looksLike}</p>
                    <ul className="mt-3 space-y-2">
                      {p.looksLike.map((l) => (
                        <li key={l} className="flex gap-3 leading-relaxed text-ink-soft">
                          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ACCENTS[i] }} />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {p.link ? (
                    <a
                      href={p.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-block font-semibold text-teal-deep underline decoration-2 underline-offset-4"
                    >
                      {p.link.label}
                      <span className="sr-only">{d.common.opensNewTab}</span>
                    </a>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section labelledBy="families-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionIntro id="families-title" eyebrow={t.familiesEyebrow} title={t.familiesTitle} />
            <CheckList items={pages.approachForFamilies} className="mt-8" />
            <ButtonLink href={href(locale, "gettingStarted")} className="mt-8" arrow>
              {t.familiesCta}
            </ButtonLink>
          </div>
          <Reveal className="overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={photos.floorGame.src}
              alt={photos.floorGame.alt}
              width={photos.floorGame.width}
              height={photos.floorGame.height}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="ink" labelledBy="team-title">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
          <SectionIntro id="team-title" tone="ink" eyebrow={t.teamEyebrow} title={t.teamTitle} lede={t.teamLede} />
          <div className="lg:justify-self-end">
            <ButtonLink
              href={href(locale, "careers")}
              hrefLang={hasLocale("careers", locale) ? undefined : "en-US"}
              variant="secondary"
              arrow
            >
              {t.teamCta}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <NextStep
        locale={locale}
        title={t.nextTitle}
        body={t.nextBody}
        actions={
          <>
            <ButtonLink href={href(locale, "tour")} variant="secondary" size="lg" arrow>
              {t.nextTour}
            </ButtonLink>
            <ButtonLink href={href(locale, "services")} variant="light" size="lg">
              {t.nextServices}
            </ButtonLink>
          </>
        }
        related={[
          { ...t.related[0]!, href: href(locale, "gettingStarted") },
          { ...t.related[1]!, href: href(locale, "about") },
        ]}
      />
    </>
  );
}
