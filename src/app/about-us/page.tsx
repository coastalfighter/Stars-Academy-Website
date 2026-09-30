import type { Metadata } from "next";
import Image from "next/image";
import { aboutStory, aboutVision } from "@/content/pages";
import { site, values } from "@/content/site";
import { photos } from "@/content/photos";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { NextStep } from "@/components/page/NextStep";
import { ContactCard } from "@/components/page/ContactCard";
import { ButtonLink } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About STARS — Locally Owned in Batesville Since 2009",
  description:
    "STARS Academy is a locally owned therapy clinic and developmental preschool in Batesville, Arkansas — about 85 people serving about 140 children and their families.",
  alternates: { canonical: "/about-us" },
};

const LETTER_COLORS = ["text-gold-deep", "text-coral-deep", "text-teal-deep", "text-blue-deep", "text-berry"] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "About", href: "/about-us" }]}
        eyebrow="About STARS"
        title="Locally owned. Deeply rooted. Built around children."
        lede="Since 2009, STARS Academy has grown from a Batesville therapy clinic and developmental preschool into a team of about 85 people serving about 140 children and their families."
      />

      <Section tone="paper" labelledBy="story-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionIntro id="story-title" eyebrow="Our story" title="We are family." />
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
              {aboutStory.map((p) => (
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
        <SectionIntro
          id="name-title"
          eyebrow="Our name"
          title="What STARS stands for."
          lede="Our name is also our promise to every child and family."
          align="center"
        />
        <Reveal as="ol" className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-5">
          {site.acronym.map((word, i) => (
            <li key={word} className="card flex flex-col items-center gap-2 p-6 text-center">
              <span aria-hidden="true" className={`font-display text-6xl leading-none ${LETTER_COLORS[i]}`}>
                {word[0]}
              </span>
              <span className="font-display text-xl">{word}</span>
            </li>
          ))}
        </Reveal>
      </Section>

      <Section tone="ink" labelledBy="vision-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro id="vision-title" tone="ink" eyebrow="Our vision" title="Something good in every day." />
          </div>
          <Reveal as="p" className="font-display text-2xl leading-snug text-cream/90 lg:col-span-7 lg:text-3xl">
            {aboutVision}
          </Reveal>
        </div>
        <div className="mt-16">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cream/60">Five values that guide how we work</h3>
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {values.map((v, i) => (
              <Reveal as="li" key={v.name} delay={i * 60} className="rounded-2xl border border-cream/10 p-5">
                <p className="font-display text-sm text-gold">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 font-display text-xl text-cream">{v.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{v.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <Section labelledBy="facilities-title">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionIntro
            id="facilities-title"
            eyebrow="Our facilities"
            title="Two family-friendly facilities in Batesville."
            lede="Visit our main campus to see the classrooms, private therapy rooms and therapy gym."
          />
          <div className="space-y-4">
            <ContactCard />
            <div className="flex flex-wrap gap-3">
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-ink/15 bg-white/70 px-5 text-sm font-semibold hover:border-ink/40"
              >
                STARS on Facebook<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-ink/15 bg-white/70 px-5 text-sm font-semibold hover:border-ink/40"
              >
                STARS on Instagram<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </Section>

      <NextStep
        title="Get to know us in person."
        body="Visit STARS, meet our team and see how we work with children every day."
        actions={
          <ButtonLink href="/schedule-a-tour" variant="secondary" size="lg" arrow>
            Schedule a tour
          </ButtonLink>
        }
        related={[
          { title: "Careers at STARS", body: "Do the work you trained for, with a team behind you.", href: "/careers" },
          { title: "Our approach", body: "The philosophy behind the work.", href: "/approach" },
        ]}
      />
    </>
  );
}
