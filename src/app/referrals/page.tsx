import type { Metadata } from "next";
import Link from "next/link";
import { referralCriteria, referralFacts, site } from "@/content/site";
import { referralSpeechApproaches, referralSteps, schoolTransition } from "@/content/pages";
import { services } from "@/content/services";
import { faqsByGroup } from "@/content/faq";
import { PageHero } from "@/components/page/PageHero";
import { Section, SectionIntro } from "@/components/page/Section";
import { StepList } from "@/components/page/Lists";
import { FaqList } from "@/components/page/FaqList";
import { NextStep } from "@/components/page/NextStep";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "For Referral Partners — Physicians, Therapists & Schools",
  description:
    "Referring a child to STARS Academy: who we serve, eligibility criteria, clinical scope for speech, OT, PT and nursing, and how to send a referral.",
  alternates: { canonical: "/referrals" },
};

export default function ReferralsPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "For referral partners", href: "/referrals" }]}
        eyebrow="For physicians, therapists & schools"
        title="Referring a child to STARS, made simple."
        lede="Everything you need before referring — who we serve, eligibility, clinical scope and how to send a prescription — on one page."
        accent="#4f86c6"
        actions={
          <>
            <ButtonLink href="#make-referral" size="lg" arrow>
              Start a referral
            </ButtonLink>
            <ButtonLink href={site.phone.href} size="lg" variant="ghost">
              {site.phone.display}
            </ButtonLink>
          </>
        }
      />

      <Section tone="paper" labelledBy="glance-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionIntro id="glance-title" eyebrow="STARS at a glance" title="The essentials." />
            <Reveal className="card mt-8 overflow-hidden">
              <dl className="divide-y divide-line">
                {[...referralFacts, { label: "Hours", value: site.hours.display }].map((f) => (
                  <div key={f.label} className="grid gap-1 px-7 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                    <dt className="font-semibold">{f.label}</dt>
                    <dd className="text-ink-soft">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <SectionIntro id="criteria-title" eyebrow="Eligibility" title="Referral criteria" />
            <p className="mt-4 text-ink-soft">A child is eligible for services at STARS when they:</p>
            <ol className="mt-5 space-y-4">
              {referralCriteria.map((c, i) => (
                <Reveal as="li" key={c} delay={i * 60} className="flex gap-4 leading-relaxed">
                  <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-sm font-bold text-gold">
                    {i + 1}
                  </span>
                  {c}
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section labelledBy="how-title">
        <SectionIntro id="how-title" eyebrow="How to refer" title="Four steps, and we handle most of them." />
        <div className="mt-10">
          <StepList steps={referralSteps} />
        </div>
      </Section>

      <Section tone="sand" labelledBy="scope-title">
        <SectionIntro id="scope-title" eyebrow="Clinical scope" title="What our team routinely supports." />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {services
            .filter((s) => s.scope)
            .map((s) => (
              <Reveal as="section" key={s.slug} className="card p-7">
                <h3 className="flex items-center gap-3 font-display text-2xl">
                  <span aria-hidden="true" className="h-3 w-3 rotate-45 rounded-[3px]" style={{ background: s.color }} />
                  {s.name}
                </h3>
                <ul className="mt-5 grid gap-x-6 gap-y-2 text-ink-soft sm:grid-cols-2">
                  {s.scope?.map((item) => (
                    <li key={item} className="flex gap-2 leading-snug">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
                      {item}
                    </li>
                  ))}
                </ul>
                {s.slug === "speech-therapy" ? (
                  <p className="mt-5 rounded-2xl bg-cream p-4 text-sm leading-relaxed text-ink-soft">
                    <strong className="text-ink">Approaches and tools used:</strong> {referralSpeechApproaches}
                  </p>
                ) : null}
                <Link href={`/services/${s.slug}`} className="mt-5 inline-block text-sm font-bold text-teal-deep underline underline-offset-4">
                  {s.name} at STARS
                </Link>
              </Reveal>
            ))}
        </div>
      </Section>

      <Section labelledBy="schools-title">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <SectionIntro id="schools-title" eyebrow="For school districts" title="Partners in the move to kindergarten." />
          <Reveal as="p" className="text-lg leading-relaxed text-ink-soft">
            {schoolTransition}
          </Reveal>
        </div>
      </Section>

      <Section id="make-referral" tone="paper" labelledBy="make-referral-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro
              id="make-referral-title"
              eyebrow="Make a referral"
              title="Request a call back from our team."
              lede="We’ll follow up with your office to confirm what we need and how to send it securely."
            />
            <p className="mt-6 leading-relaxed text-ink-soft">
              Prefer to call?{" "}
              <a href={site.phone.href} className="font-semibold text-ink underline underline-offset-4">
                {site.phone.display}
              </a>{" "}
              · {site.hours.display}
            </p>
            <p className="mt-4 rounded-2xl bg-sky/60 p-4 text-sm leading-relaxed">
              This form is for contact details only. Do not include patient names, dates of birth, diagnoses or other
              protected health information — we’ll arrange a secure method for those.
            </p>
          </div>
          <div className="lg:col-span-7">
            <InquiryForm
              audiences={["physician", "school", "other"]}
              reasons={["referral", "question", "tour"]}
              defaultAudience="physician"
              defaultReason="referral"
              submitLabel="Request a call back"
              messageHint="General notes only — no patient identifiers."
              successNote="Our team will contact your office to confirm what we need and how to send the prescription and records securely."
            />
          </div>
        </div>
      </Section>

      <Section labelledBy="ref-faq-title">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro id="ref-faq-title" eyebrow="Questions" title="Referral FAQs" />
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqsByGroup("partners")} />
          </div>
        </div>
      </Section>

      <NextStep
        title="Visit STARS before you refer."
        body="Many providers find it helpful to see our program in person. We’re glad to arrange a visit for you or your staff."
        actions={
          <>
            <ButtonLink href="/schedule-a-tour?audience=physician&reason=tour" variant="secondary" size="lg" arrow>
              Schedule a visit
            </ButtonLink>
            <ButtonLink href="/contact-us" variant="light" size="lg">
              Contact us
            </ButtonLink>
          </>
        }
        related={[
          { title: "Our approach", body: "Relationships, regulation and neuroaffirming care.", href: "/approach" },
          { title: "All services", body: "How our disciplines work together.", href: "/services" },
        ]}
      />
    </>
  );
}
