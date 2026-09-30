import type { Metadata } from "next";
import { faqGroups, faqs, faqsByGroup } from "@/content/faq";
import { site } from "@/content/site";
import { PageHero } from "@/components/page/PageHero";
import { Section } from "@/components/page/Section";
import { FaqList } from "@/components/page/FaqList";
import { NextStep } from "@/components/page/NextStep";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/content/faq";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about STARS Academy: eligibility, Medicaid funding, hours, transportation, Spanish services, referrals and careers.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "FAQ", href: "/faq" }]}
        eyebrow="FAQ"
        title="Questions, answered plainly."
        lede={
          <>
            Can’t find what you’re looking for? Call us at{" "}
            <a href={site.phone.href} className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
              {site.phone.display}
            </a>{" "}
            — we’re happy to help.
          </>
        }
        star={null}
      >
        <nav aria-label="FAQ topics" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {faqGroups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-ink/10 bg-white/70 px-4 text-sm font-semibold hover:border-ink/30"
                >
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      {faqGroups.map((g, i) => (
        <Section key={g.id} id={g.id} tone={i % 2 === 0 ? "paper" : "cream"} labelledBy={`${g.id}-title`} className="!py-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 id={`${g.id}-title`} className="display-md lg:col-span-4">
              {g.label}
            </h2>
            <div className="lg:col-span-8">
              <FaqList items={faqsByGroup(g.id)} />
            </div>
          </div>
        </Section>
      ))}
      <JsonLd data={faqSchema(faqs)} />

      <NextStep
        title="Still have a question?"
        body="Send us a message and we’ll route it to the right person — or come see STARS for yourself."
        actions={
          <>
            <ButtonLink href="/contact-us" variant="secondary" size="lg" arrow>
              Contact STARS
            </ButtonLink>
            <ButtonLink href="/schedule-a-tour" variant="light" size="lg">
              Schedule a tour
            </ButtonLink>
          </>
        }
      />
    </>
  );
}
