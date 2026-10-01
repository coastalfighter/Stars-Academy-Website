import type { Metadata } from "next";
import { site } from "@/content/site";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { POSITIONS } from "@/lib/validation/inquiry";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Apply to Work at STARS",
  description:
    "Apply to STARS Academy in two short steps: tell us about yourself, then complete the official employment application.",
  alternates: { canonical: "/careers/apply" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ApplyPage({ searchParams }: { searchParams: SearchParams }) {
  const { position } = await searchParams;
  const preselected = POSITIONS.find((p) => p === position);
  return (
    <>
      <PageHero
        crumbs={[
          { label: "Careers", href: "/careers" },
          { label: "Apply", href: "/careers/apply" },
        ]}
        eyebrow="Apply"
        title="Let’s get to know you."
        lede="Applying takes two short steps. Start by telling us about yourself below, then complete our official employment application."
        star={null}
      />

      <Section className="!pt-4">
        <div className="grid gap-10 lg:grid-cols-12">
          <ol className="space-y-4 lg:col-span-4">
            <Reveal as="li" className="card p-6">
              <p className="font-display text-3xl text-accent-deep">1</p>
              <h2 className="mt-2 font-display text-xl">Tell us about you</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">Your contact details and the role you’re interested in.</p>
            </Reveal>
            <Reveal as="li" className="card p-6">
              <p className="font-display text-3xl text-accent-deep">2</p>
              <h2 className="mt-2 font-display text-xl">Complete the official application</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">
                Our secure employment application is hosted on Adobe Sign. You can attach your résumé there.
              </p>
              <a
                href={site.secureForms.employmentApplication}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-semibold text-accent-deep underline decoration-2 underline-offset-4"
              >
                Open the employment application<span className="sr-only"> (opens Adobe Sign in a new tab)</span>
              </a>
            </Reveal>
          </ol>
          <div className="lg:col-span-8">
            <ApplyForm position={preselected} />
          </div>
        </div>
      </Section>
    </>
  );
}

function ApplyForm({ position }: { position?: (typeof POSITIONS)[number] }) {
  return (
    <InquiryForm
      defaultPosition={position}
      audiences={["job-seeker"]}
      reasons={["careers"]}
      submitLabel="Send my information"
      messageHint="Optional. Why are you interested in STARS?"
      successNote={
        <p>
          If you haven’t already, please complete our{" "}
          <a
            href={site.secureForms.employmentApplication}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent-deep underline underline-offset-4"
          >
            official employment application<span className="sr-only"> (opens Adobe Sign in a new tab)</span>
          </a>
          . Our team will contact you about next steps.
        </p>
      }
    />
  );
}
