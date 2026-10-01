import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { hiringSteps, whyStars } from "@/content/pages";
import { values } from "@/content/site";
import { faqsInGroup, getFaqs, getJobOpenings } from "@/cms/repository";
import { photos } from "@/content/photos";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { FeatureGrid, StepList } from "@/components/page/Lists";
import { FaqList } from "@/components/page/FaqList";
import { NextStep } from "@/components/page/NextStep";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Careers — Therapists, Nurses, Educators & Support Staff",
  description:
    "Join about 85 therapists, nurses, educators and support staff at STARS Academy in Batesville, AR. A true interdisciplinary team with an Adult First culture.",
  alternates: { canonical: "/careers" },
};

export default async function CareersPage() {
  const [faqs, openings] = await Promise.all([getFaqs("en"), getJobOpenings()]);
  return (
    <>
      <PageHero
        crumbs={[{ label: "Careers", href: "/careers" }]}
        eyebrow="Careers at STARS"
        title="Do the work you trained for, with a team behind you."
        lede="About 85 therapists, nurses, educators and support staff make STARS what it is. If you want to do meaningful work with young children — as part of a team that actually works together — we’d love to meet you."
        actions={
          <>
            <ButtonLink href="#roles" size="lg" arrow>
              See open roles
            </ButtonLink>
            <ButtonLink href="/careers/apply" size="lg" variant="ghost">
              Apply now
            </ButtonLink>
          </>
        }
      />

      <Section tone="paper" labelledBy="why-title">
        <SectionIntro id="why-title" eyebrow="Why STARS" title="Why therapists, nurses and educators choose STARS." />
        <div className="mt-10">
          <FeatureGrid items={whyStars} columns={4} />
        </div>
      </Section>

      <Section labelledBy="life-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={photos.ballPit.src}
              alt={photos.ballPit.alt}
              width={photos.ballPit.width}
              height={photos.ballPit.height}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
          <div>
            <SectionIntro
              id="life-title"
              eyebrow="Life at STARS"
              title="What working here is like."
              lede="Our values — positivity, purpose, communication, empowerment and adaptability — aren’t posters on a wall. They shape how we hire, how we support each other and how we show up for children."
            />
            <ul className="mt-8 flex flex-wrap gap-2">
              {values.map((v) => (
                <li key={v.name} className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-semibold">
                  {v.name}
                </li>
              ))}
            </ul>
            <Link href="/approach" className="mt-6 inline-block font-semibold text-teal-deep underline underline-offset-4">
              Read about our Adult First approach
            </Link>
          </div>
        </div>
      </Section>

      <Section id="roles" tone="ink" labelledBy="roles-title">
        <SectionIntro
          id="roles-title"
          tone="ink"
          eyebrow="Open roles"
          title="Positions at STARS"
          lede="We hire for these roles on an ongoing basis. Don’t see your role? Apply anyway — we’d like to hear from you."
        />
        <ul className="mt-10 grid gap-4 lg:grid-cols-2">
          {openings.map((r) => (
            <Reveal as="li" key={r.id} className="flex flex-col rounded-[var(--radius-card)] border border-cream/10 bg-cream/[0.03] p-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{r.team}</p>
              <h3 className="mt-2 font-display text-2xl">{r.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-cream/75">{r.body}</p>
              <div className="mt-5 rounded-2xl bg-cream/5 p-4">
                <p className="text-sm font-bold text-cream">Requirements</p>
                <ul className="mt-2 space-y-1 text-sm text-cream/75">
                  {r.requirements.map((q) => (
                    <li key={q} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
              <ButtonLink href={r.position ? `/careers/apply?position=${r.position}` : "/careers/apply"} variant="secondary" className="mt-6 self-start" arrow>
                Apply<span className="sr-only"> for {r.title}</span>
              </ButtonLink>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section labelledBy="hiring-title">
        <SectionIntro id="hiring-title" eyebrow="How hiring works" title="Four simple steps." />
        <div className="mt-10">
          <StepList steps={hiringSteps} />
        </div>
      </Section>

      <Section tone="paper" labelledBy="jobs-faq-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro id="jobs-faq-title" eyebrow="Questions" title="Careers FAQ" />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsInGroup(faqs, "jobs")} />
          </div>
        </div>
      </Section>

      <NextStep
        title="Ready to join the STARS team?"
        body="Send us your information — we look forward to hearing from you."
        actions={
          <ButtonLink href="/careers/apply" variant="secondary" size="lg" arrow>
            Apply now
          </ButtonLink>
        }
        related={[{ title: "Our approach", body: "Relationship-based, sensory-informed and neuroaffirming.", href: "/approach" }]}
      />
    </>
  );
}
