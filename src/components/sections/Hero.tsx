import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { href } from "@/i18n/routes";
import { getContent } from "@/content";
import { homeCopy } from "@/content/copy/home";
import { ButtonLink } from "@/components/ui/Button";

const DISCIPLINE_COLORS = ["bg-coral", "bg-teal", "bg-blue", "bg-berry", "bg-accent"] as const;

export function Hero({ locale }: { locale: Locale }) {
  const t = homeCopy[locale].hero;
  const d = getDictionary(locale);
  const { site } = getContent(locale);
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[100svh] items-center pt-32 pb-20 md:pt-40">
      {/* Soft wash on the copy side keeps text crisp over the 3D scene. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-base via-base/80 to-transparent lg:block"
      />
      <div className="container-x relative">
        <div className="over-scene copy-col lg:max-w-[640px]">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 id="hero-title" className="display-xl mt-6">
            {t.titleBefore}{" "}
            <span className="relative whitespace-nowrap text-teal-deep">
              {t.titleEmphasis}
              <svg aria-hidden="true" viewBox="0 0 300 16" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-accent">
                <path d="M2 11C60 3 120 3 150 8s110 6 146-2" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            {t.titleAfter}
          </h1>
          <p className="lede mt-7">
            {t.lede}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href={href(locale, "gettingStarted")} size="lg" arrow>
              {t.primaryCta}
            </ButtonLink>
            <ButtonLink href={href(locale, "tour")} size="lg" variant="ghost">
              {t.secondaryCta}
            </ButtonLink>
          </div>
          <p className="mt-5 text-sm text-muted">
            {t.preferTalk}{" "}
            <a href={site.phone.href} className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">
              {site.phone.display}
            </a>{" "}
            — {locale === "en" ? site.hours.short.toLowerCase() : site.hours.short}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-2" aria-label={t.teamLabel}>
            <span className="mr-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">{t.teamLabel}</span>
            {t.disciplines.map((label, i) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink-soft">
                <span aria-hidden="true" className={`h-2 w-2 rotate-45 rounded-[2px] ${DISCIPLINE_COLORS[i]}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <a
        href="#pathways"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted md:flex"
      >
        {d.common.scrollToExplore}
        <span aria-hidden="true" className="flex h-9 w-5 justify-center rounded-full border-2 border-ink/25 pt-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-ink/50" />
        </span>
      </a>
    </section>
  );
}
