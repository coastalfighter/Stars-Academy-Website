import type { Metadata } from "next";
import Image from "next/image";
import { approachForFamilies, approachPillars } from "@/content/pages";
import { photos } from "@/content/photos";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { CheckList } from "@/components/page/Lists";
import { NextStep } from "@/components/page/NextStep";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Our Approach — Relationships, Regulation & Neuroaffirming Care",
  description:
    "How STARS Academy works with children: connection first, regulation, Conscious Discipline, an Adult First mindset, and sensory-informed, neuroaffirming care — in everyday words.",
  alternates: { canonical: "/approach" },
};

const ACCENTS = ["#f2c230", "#e8735a", "#2f8f8a", "#4f86c6", "#c4323a", "#9a6f00"] as const;

export default function ApproachPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Our approach", href: "/approach" }]}
        eyebrow="Our approach"
        title="Children learn best when they feel safe, connected and understood."
        lede="That single idea shapes everything at STARS — how our classrooms run, how therapists work, and how we support our own team. Here’s what our approach means, without the jargon."
        accent="#2f8f8a"
      >
        <Reveal className="glass mt-10 max-w-3xl p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">In short</p>
          <p className="mt-2 font-display text-xl leading-snug sm:text-2xl">
            We start with <span className="text-teal-deep">connection</span>, help children find{" "}
            <span className="text-teal-deep">calm</span>, respect how each child’s brain and body work — and then build
            skills from there.
          </p>
        </Reveal>
      </PageHero>

      <Section tone="paper" labelledBy="pillars-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionIntro id="pillars-title" eyebrow="Six ideas" title="What guides our work" />
              <nav aria-label="Approach topics" className="mt-8">
                <ol className="space-y-1">
                  {approachPillars.map((p, i) => (
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
            {approachPillars.map((p, i) => (
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
                    <p className="text-sm font-bold text-ink">What it can look like</p>
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
                      <span className="sr-only"> (opens in a new tab)</span>
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
            <SectionIntro id="families-title" eyebrow="For families" title="What this means for your child" />
            <CheckList items={approachForFamilies} className="mt-8" />
            <ButtonLink href="/getting-started" className="mt-8" arrow>
              Is STARS right for my child?
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
          <SectionIntro
            id="team-title"
            tone="ink"
            eyebrow="For our team"
            title="What this means if you work here"
            lede="Adult First isn’t just for classrooms. It shapes how we support our own people — because regulated adults are the foundation of everything we do for children."
          />
          <div className="lg:justify-self-end">
            <ButtonLink href="/careers" variant="secondary" arrow>
              Careers at STARS
            </ButtonLink>
          </div>
        </div>
      </Section>

      <NextStep
        title="See our approach in action."
        body="The best way to understand how STARS feels is to visit. Come see the classrooms, meet the team and ask anything."
        actions={
          <>
            <ButtonLink href="/schedule-a-tour" variant="secondary" size="lg" arrow>
              Schedule a tour
            </ButtonLink>
            <ButtonLink href="/services" variant="light" size="lg">
              Explore services
            </ButtonLink>
          </>
        }
        related={[
          { title: "Getting started", body: "Eligibility, funding and the steps to enroll.", href: "/getting-started" },
          { title: "About STARS", body: "Our story, vision and values.", href: "/about-us" },
        ]}
      />
    </>
  );
}
