import Image from "next/image";
import { enrollmentSteps, fitSignals, site } from "@/content/site";
import { photos } from "@/content/photos";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Eligibility() {
  return (
    <section id="eligibility" aria-labelledby="eligibility-title" className="relative z-10 scroll-mt-24 bg-paper py-28 lg:py-36">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow">For families</p>
            <h2 id="eligibility-title" className="display-lg mt-5">
              Could STARS help <em className="text-teal-deep">your</em> child?
            </h2>
            <p className="lede mt-5">STARS may be a good fit if your child is between birth and age six and…</p>
          </Reveal>
          <ul className="mt-8 space-y-3">
            {fitSignals.map((s, i) => (
              <Reveal as="li" key={s} delay={i * 70} className="flex gap-4 rounded-2xl bg-cream p-5">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-6 w-6 shrink-0 text-teal">
                  <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
                  <path d="m7 12.5 3.2 3L17 8.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="leading-relaxed">{s}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-8 rounded-2xl border border-gold/60 bg-gold/10 p-5 leading-relaxed">
            <strong className="font-semibold">Paying for services:</strong> Services are paid for through {site.funding}. We
            can check your child’s coverage for you. You don’t need a diagnosis to ask a question.
          </Reveal>
        </div>

        <div className="lg:col-span-6">
          <Reveal className="relative overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={photos.parentChildWalk.src}
              alt={photos.parentChildWalk.alt}
              width={photos.parentChildWalk.width}
              height={photos.parentChildWalk.height}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>

          <Reveal className="mt-8">
            <h3 className="font-display text-2xl">Getting started takes four steps</h3>
          </Reveal>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {enrollmentSteps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 80} className="card relative p-6">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-lg text-gold"
                >
                  {i + 1}
                </span>
                <h4 className="mt-4 font-display text-lg">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/getting-started#inquiry" size="lg" arrow>
              Start a conversation
            </ButtonLink>
            <ButtonLink href={site.phone.href} size="lg" variant="ghost">
              Call {site.phone.display}
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
