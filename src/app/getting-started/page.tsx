import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { eligibilityFactors, firstCallToFirstDay, goodFitSignals } from "@/content/pages";
import { faqsByGroup } from "@/content/faq";
import { site } from "@/content/site";
import { photos } from "@/content/photos";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { CheckList, StepList } from "@/components/page/Lists";
import { FaqList } from "@/components/page/FaqList";
import { NextStep } from "@/components/page/NextStep";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Getting Started — Eligibility, Funding & Enrollment",
  description:
    "Could STARS help your child? Who STARS serves, how day treatment is paid for (Medicaid, ARKids First-A, SSI, TEFRA) and the steps from first call to first day.",
  alternates: { canonical: "/getting-started" },
};

const PRACTICAL = [
  { title: "Hours", body: site.hours.display },
  { title: "Transportation", body: "STARS operates clinic-owned vans that bring children to and from the clinic." },
  { title: "Language", body: "Speech-language evaluations and therapy are offered in Spanish." },
] as const;

export default function GettingStartedPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Getting started", href: "/getting-started" }]}
        eyebrow="Getting started"
        title="Could STARS help your child? Let’s find out together."
        lede="You don’t need to have everything figured out before you contact us. This page explains who STARS serves, how services are paid for and what the steps look like — and our team will walk you through the rest."
        accent="#e8735a"
        actions={
          <>
            <ButtonLink href="#inquiry" size="lg" arrow>
              Send an inquiry
            </ButtonLink>
            <ButtonLink href={site.phone.href} size="lg" variant="ghost">
              {site.phone.display}
            </ButtonLink>
          </>
        }
      />

      <Section tone="paper" labelledBy="fit-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionIntro
              id="fit-title"
              eyebrow="Is STARS a good fit?"
              title="STARS may be right for your child if…"
              lede="Any one of these is a good reason to call. You don’t need a diagnosis to ask a question."
            />
            <CheckList items={goodFitSignals} className="mt-8" />
          </div>
          <Reveal className="overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={photos.parentChildWalk.src}
              alt={photos.parentChildWalk.alt}
              width={photos.parentChildWalk.width}
              height={photos.parentChildWalk.height}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </Section>

      <Section labelledBy="eligibility-title">
        <SectionIntro
          id="eligibility-title"
          eyebrow="Eligibility"
          title="Three things determine eligibility."
          lede="We’ll help you with each one — including checking your coverage and coordinating with your child’s doctor."
        />
        <div className="mt-10">
          <StepList steps={eligibilityFactors} columns={3} />
        </div>
        <Reveal className="mt-8 rounded-2xl border border-gold/60 bg-gold/10 p-6 leading-relaxed">
          <strong className="font-semibold">Paying for services:</strong> Day treatment services are paid for through{" "}
          {site.funding}. STARS can contact your insurance provider to find out what therapy services your child’s plan
          covers.
        </Reveal>
      </Section>

      <Section tone="ink" labelledBy="process-title">
        <SectionIntro id="process-title" tone="ink" eyebrow="The process" title="From first call to first day." />
        <div className="mt-10">
          <StepList steps={firstCallToFirstDay} dark columns={5} />
        </div>
      </Section>

      <Section labelledBy="practical-title">
        <SectionIntro id="practical-title" eyebrow="Practical details" title="Good to know." />
        <dl className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PRACTICAL.map((p) => (
            <div key={p.title} className="card p-6">
              <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{p.title}</dt>
              <dd className="mt-2 leading-relaxed">{p.body}</dd>
            </div>
          ))}
          <div className="card p-6">
            <dt className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Medical needs</dt>
            <dd className="mt-2 leading-relaxed">
              Full-time licensed nurses are on staff.{" "}
              <Link href="/services/nursing-care" className="font-semibold text-teal-deep underline underline-offset-4">
                Learn about nursing care
              </Link>
              .
            </dd>
          </div>
        </dl>
      </Section>

      <Section id="inquiry" tone="sand" labelledBy="inquiry-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro
              id="inquiry-title"
              eyebrow="Start the conversation"
              title="Tell us about your child."
              lede="Send a short inquiry and someone from our team will contact you. There’s no commitment — it’s simply the first step."
            />
            <Reveal className="card mt-8 p-6">
              <h3 className="font-display text-lg">Already spoken with our team?</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">
                If STARS has asked you to complete the enrollment inquiry packet, you can open it securely here.
              </p>
              <a
                href={site.secureForms.enrollmentPacket}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-semibold text-teal-deep underline decoration-2 underline-offset-4"
              >
                Open the enrollment inquiry packet<span className="sr-only"> (opens Adobe Sign in a new tab)</span>
              </a>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <InquiryForm
              audiences={["family"]}
              reasons={["eligibility", "tour", "question"]}
              defaultReason="eligibility"
              submitLabel="Send my inquiry"
              messageHint="A sentence or two is plenty — for example, “My 2-year-old isn’t talking much yet.” Please don’t include diagnoses or medical records."
            />
          </div>
        </div>
      </Section>

      <Section labelledBy="gs-faq-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro id="gs-faq-title" eyebrow="Questions families ask" title="Frequently asked questions" />
            <ButtonLink href="/faq" variant="ghost" className="mt-6" arrow>
              See all FAQs
            </ButtonLink>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsByGroup("families")} />
          </div>
        </div>
      </Section>

      <NextStep
        title="The easiest next step? Come visit."
        body="A tour is relaxed, with no commitment. You’ll see the classrooms, meet our team and get your questions answered in person."
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
          { title: "Our approach", body: "How we help children feel safe, connected and understood.", href: "/approach" },
          { title: "Nursing care", body: "Care for children with medical needs.", href: "/services/nursing-care" },
        ]}
      />
    </>
  );
}
