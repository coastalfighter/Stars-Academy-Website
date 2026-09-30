import type { Metadata } from "next";
import Link from "next/link";
import { whoHandlesWhat } from "@/content/pages";
import { site } from "@/content/site";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { ContactCard } from "@/components/page/ContactCard";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AUDIENCES, REASONS } from "@/lib/validation/inquiry";

export const metadata: Metadata = {
  title: "Contact STARS Academy",
  description: "Call, visit or send a message to STARS Academy, 200 General St., Batesville, AR. Monday – Friday, 7:00 a.m. – 3:00 p.m.",
  alternates: { canonical: "/contact-us" },
};

const QUICK = [
  { q: "Interested in STARS for your child?", label: "Getting started", href: "/getting-started" },
  { q: "Want to see STARS in person?", label: "Schedule a tour", href: "/schedule-a-tour" },
  { q: "Referring a patient or student?", label: "Referral information", href: "/referrals" },
  { q: "Looking for a job?", label: "Careers", href: "/careers" },
] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const pick = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <>
      <PageHero
        crumbs={[{ label: "Contact", href: "/contact-us" }]}
        eyebrow="Contact"
        title="We’re here to help."
        lede="Call, visit or send a message — we’ll make sure it reaches the right person."
        star={null}
      >
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group glass flex h-full flex-col justify-between gap-4 p-5 transition-transform hover:-translate-y-0.5">
                <span className="text-sm text-muted">{item.q}</span>
                <span className="flex items-center justify-between font-display text-lg">
                  {item.label} <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PageHero>

      <Section tone="paper" className="!pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Reveal>
              <h2 className="display-md">Reach us directly</h2>
              <a href={site.phone.href} className="mt-4 block font-display text-4xl text-teal-deep">
                {site.phone.display}
              </a>
              <p className="mt-2 text-ink-soft">{site.hours.display}</p>
            </Reveal>
            <ContactCard />
            <Reveal className="card p-6">
              <h3 className="font-display text-xl">Who handles what</h3>
              <ul className="mt-4 space-y-4">
                {whoHandlesWhat.map((w) => (
                  <li key={w.team}>
                    <Link href={w.href} className="font-semibold underline-offset-4 hover:underline">
                      {w.team}
                    </Link>
                    <p className="text-sm leading-relaxed text-ink-soft">{w.body}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <h2 className="sr-only">Send a message</h2>
            <InquiryForm
              defaultAudience={pick(params.audience, AUDIENCES)}
              defaultReason={pick(params.reason, REASONS) ?? "question"}
              submitLabel="Send message"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
