import type { Metadata } from "next";
import Link from "next/link";
import { familyTopics, whoHandlesWhat } from "@/content/pages";
import { faqsByGroup } from "@/content/faq";
import { site } from "@/content/site";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { FaqList } from "@/components/page/FaqList";
import { NextStep } from "@/components/page/NextStep";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Current Families",
  description:
    "Quick answers for families whose children attend STARS Academy: hours, absences, transportation, health and medications, kindergarten transition and who to contact.",
  alternates: { canonical: "/families" },
};

const RESOURCES = [
  {
    title: "Conscious Discipline",
    body: "The social-emotional approach we use at STARS — with ideas you can try at home.",
    href: site.consciousDisciplineUrl,
    external: true,
  },
  {
    title: "Our approach, in plain language",
    body: "What relationships, regulation and neuroaffirming care look like day to day.",
    href: "/approach",
    external: false,
  },
  {
    title: "STARS on Facebook",
    body: "Photos, reminders and news from our classrooms.",
    href: site.social.facebook,
    external: true,
  },
] as const;

export default function FamiliesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Current families", href: "/families" }]}
        eyebrow="For current families"
        title="Everything you need, in one place."
        lede="Quick answers for families whose children already attend STARS. Can’t find what you need? Call us — we’re glad to help."
        accent="#4f86c6"
        actions={
          <ButtonLink href={site.phone.href} size="lg">
            Call {site.phone.display}
          </ButtonLink>
        }
      />

      <Section tone="paper" labelledBy="topics-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <nav aria-labelledby="topics-title" className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <h2 id="topics-title" className="eyebrow">
                On this page
              </h2>
              <ul className="mt-5 space-y-1">
                {[...familyTopics.map((t) => ({ id: t.id, title: t.title })), { id: "resources", title: "Resources" }, { id: "contact", title: "Who to contact" }].map(
                  (t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="block rounded-xl px-3 py-2 font-semibold text-ink-soft hover:bg-cream hover:text-ink">
                        {t.title}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </nav>
          <div className="space-y-5 lg:col-span-8">
            {familyTopics.map((t) => (
              <Reveal as="section" key={t.id} className="card p-7 sm:p-9">
                <h3 id={t.id} className="scroll-mt-28 font-display text-2xl">
                  {t.title}
                </h3>
                <div className="mt-3 space-y-3 leading-relaxed text-ink-soft">
                  {t.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                {t.id === "absences" ? (
                  <a href={site.phone.href} className="mt-4 inline-block font-semibold text-teal-deep underline underline-offset-4">
                    Call {site.phone.display}
                  </a>
                ) : null}
                {t.id === "health" ? (
                  <Link href="/services/nursing-care" className="mt-4 inline-block font-semibold text-teal-deep underline underline-offset-4">
                    How our nurses support your child’s health
                  </Link>
                ) : null}
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section id="resources" labelledBy="resources-title">
        <SectionIntro id="resources-title" eyebrow="Resources" title="Resources for families" />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {RESOURCES.map((r) => (
            <li key={r.title}>
              {r.external ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="card block h-full p-6 transition-transform hover:-translate-y-0.5">
                  <span className="font-display text-xl">{r.title}</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                  <span className="mt-2 block leading-relaxed text-ink-soft">{r.body}</span>
                </a>
              ) : (
                <Link href={r.href} className="card block h-full p-6 transition-transform hover:-translate-y-0.5">
                  <span className="font-display text-xl">{r.title}</span>
                  <span className="mt-2 block leading-relaxed text-ink-soft">{r.body}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="contact" tone="sand" labelledBy="contact-title">
        <SectionIntro id="contact-title" eyebrow="Who to contact" title="We’ll get you to the right person." />
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {whoHandlesWhat.map((w) => (
            <li key={w.team} className="card p-6">
              <p className="font-display text-lg">{w.team}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{w.body}</p>
              <a href={site.phone.href} className="mt-4 inline-block font-semibold text-teal-deep">
                {site.phone.display}
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="quick-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro id="quick-title" eyebrow="Quick questions" title="Answers for current families" />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsByGroup("current")} />
          </div>
        </div>
      </Section>

      <NextStep
        title="Have a question we didn’t answer?"
        body="Send us a message and we’ll route it to the right person."
        actions={
          <ButtonLink href="/contact-us?audience=current-family&reason=current-family" variant="secondary" size="lg" arrow>
            Contact STARS
          </ButtonLink>
        }
        related={[
          { title: "Nursing care", body: "How our nurses support your child’s health.", href: "/services/nursing-care" },
          { title: "All FAQs", body: "Answers for families, partners and job seekers.", href: "/faq" },
        ]}
      />
    </>
  );
}
