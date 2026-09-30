import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/content/services";
import { site } from "@/content/site";
import { togetherReasons } from "@/content/pages";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { FeatureGrid } from "@/components/page/Lists";
import { NextStep } from "@/components/page/NextStep";
import { Arrow, ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Services — Therapy, Nursing & Developmental Classrooms",
  description:
    "Five disciplines, one coordinated plan: developmental classrooms, speech, occupational and physical therapy, and on-site nursing for children birth to 6 in Batesville, AR.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Services", href: "/services" }]}
        eyebrow="Services"
        title="Five disciplines. One coordinated plan."
        lede="Every child at STARS spends the day in a developmental classroom, with the therapy and nursing care they need woven into that same day. Here’s how each part works — and how they work together."
      />

      <Section tone="paper" labelledBy="together-title">
        <SectionIntro id="together-title" eyebrow="Why it works better together" title="Children don’t grow in separate boxes. Their care shouldn’t either." />
        <div className="mt-10">
          <FeatureGrid items={togetherReasons} />
        </div>
      </Section>

      <Section labelledBy="services-list-title">
        <SectionIntro id="services-list-title" eyebrow="Our services" title="Explore each service." />
        <ol className="mt-10 space-y-5">
          {services.map((s, i) => (
            <Reveal as="li" key={s.slug}>
              <article className="card grid gap-8 overflow-hidden p-7 sm:p-10 lg:grid-cols-12" aria-labelledby={`svc-${s.slug}`}>
                <div className="lg:col-span-5">
                  <p className="flex items-center gap-3 text-sm font-bold tabular-nums text-muted">
                    <span aria-hidden="true" className="h-3.5 w-3.5 rotate-45 rounded-[3px]" style={{ background: s.color }} />
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 id={`svc-${s.slug}`} className="mt-4 font-display text-3xl">
                    {s.name}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-soft">{s.what}</p>
                  <Link href={`/services/${s.slug}`} className="group mt-6 inline-flex items-center gap-2 font-bold text-teal-deep">
                    Learn more<span className="sr-only"> about {s.name}</span> <Arrow />
                  </Link>
                </div>
                <ul className="space-y-3 lg:col-span-7">
                  {s.provides.slice(0, 3).map((p) => (
                    <li key={p} className="flex gap-3 rounded-2xl bg-cream p-4 leading-relaxed">
                      <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="sand" labelledBy="pay-title">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <SectionIntro id="pay-title" eyebrow="Funding" title="How services are paid for" />
          <Reveal className="space-y-4 text-lg leading-relaxed text-ink-soft">
            <p>
              Day treatment services are paid for through {site.funding}. STARS can contact your insurance provider to find
              out what therapy services your child’s plan covers.
            </p>
            <p>Treatment must be prescribed by your child’s primary care physician.</p>
            <ButtonLink href="/getting-started" arrow>
              Eligibility &amp; enrollment
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <NextStep
        title="Not sure which services your child needs?"
        body="You don’t have to know. Tell us what you’re noticing, and we’ll help you figure out the right next step."
        actions={
          <>
            <ButtonLink href="/getting-started#inquiry" variant="secondary" size="lg" arrow>
              Start a conversation
            </ButtonLink>
            <ButtonLink href="/schedule-a-tour" variant="light" size="lg">
              Schedule a tour
            </ButtonLink>
          </>
        }
        related={[
          { title: "Our approach", body: "The philosophy behind how we work with children.", href: "/approach" },
          { title: "For referral partners", body: "Eligibility and how to refer a child.", href: "/referrals" },
        ]}
      />
    </>
  );
}
