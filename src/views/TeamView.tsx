import type { Locale } from "@/i18n/config";
import { href } from "@/i18n/routes";
import { communityCopy } from "@/content/copy/community";
import { getTeam } from "@/cms/repository";
import { TEAM_GROUPS } from "@/cms/schemas";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { NextStep } from "@/components/page/NextStep";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TeamCard } from "@/components/community/TeamCard";

export async function TeamView({ locale }: { locale: Locale }) {
  const t = communityCopy[locale].team;
  const team = await getTeam(locale);
  const groups = TEAM_GROUPS.map((g) => ({ id: g, people: team.filter((m) => m.group === g) })).filter((g) => g.people.length > 0);

  return (
    <>
      <PageHero locale={locale} crumbs={[{ label: t.crumb, href: href(locale, "team") }]} eyebrow={t.eyebrow} title={t.title} lede={t.lede} />

      <Section tone="paper" labelledBy="disciplines-title">
        <SectionIntro id="disciplines-title" title={t.disciplinesTitle} />
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.disciplines.map((d, i) => (
            <Reveal as="li" key={d.name} delay={i * 50} className="rounded-[var(--radius-card)] border border-line bg-cream p-6">
              <p className="font-display text-xl">{d.name}</p>
              <p className="mt-2 leading-relaxed text-ink-soft">{d.body}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      {groups.length > 0 ? (
        <Section labelledBy="people-title">
          <SectionIntro id="people-title" title={t.peopleTitle} />
          {groups.map((g) => (
            <section key={g.id} aria-labelledby={`team-${g.id}`} className="mt-12">
              <h3 id={`team-${g.id}`} className="text-xs font-bold uppercase tracking-[0.18em] text-teal-deep">
                {t.groups[g.id]}
              </h3>
              <ul className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {g.people.map((m) => (
                  <li key={m.id}>
                    <TeamCard member={m} spanishLabel={t.speaksSpanishLabel} spanishText={t.speaksSpanish} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Section>
      ) : null}

      <NextStep
        locale={locale}
        title={t.joinTitle}
        body={t.joinBody}
        actions={
          <ButtonLink href={href(locale, "careers")} variant="secondary" size="lg" arrow>
            {t.joinCta}
          </ButtonLink>
        }
      />
    </>
  );
}
