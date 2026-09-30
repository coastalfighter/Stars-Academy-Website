import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/Button";

const DISCIPLINES = [
  { label: "Speech", color: "bg-coral" },
  { label: "Occupational", color: "bg-teal" },
  { label: "Physical", color: "bg-blue" },
  { label: "Nursing", color: "bg-berry" },
  { label: "Classrooms", color: "bg-gold" },
] as const;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[100svh] items-center pt-32 pb-20 md:pt-40">
      {/* Soft wash on the copy side keeps text crisp over the 3D scene. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-cream via-cream/80 to-transparent lg:block"
      />
      <div className="container-x relative">
        <div className="over-scene copy-col lg:max-w-[640px]">
          <p className="eyebrow">Pediatric therapy &amp; developmental preschool · Batesville, AR</p>
          <h1 id="hero-title" className="display-xl mt-6">
            Therapy, learning and care,{" "}
            <span className="relative whitespace-nowrap text-teal-deep">
              woven into
              <svg aria-hidden="true" viewBox="0 0 300 16" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-gold">
                <path d="M2 11C60 3 120 3 150 8s110 6 146-2" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            one full day.
          </h1>
          <p className="lede mt-7">
            STARS Academy serves children from birth to age six who need extra support with development. Speech,
            occupational and physical therapy, licensed nursing care and developmental classrooms all happen here —
            together, with one team that knows your child.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/#eligibility" size="lg" arrow>
              See if STARS is right for your child
            </ButtonLink>
            <ButtonLink href="/schedule-a-tour" size="lg" variant="ghost">
              Schedule a tour
            </ButtonLink>
          </div>
          <p className="mt-5 text-sm text-muted">
            Prefer to talk? Call{" "}
            <a href={site.phone.href} className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
              {site.phone.display}
            </a>{" "}
            — {site.hours.short.toLowerCase()}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-2" aria-label="One team, on site">
            <span className="mr-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">One team, on site</span>
            {DISCIPLINES.map((d) => (
              <span key={d.label} className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink-soft">
                <span aria-hidden="true" className={`h-2 w-2 rotate-45 rounded-[2px] ${d.color}`} />
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <a
        href="#pathways"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted md:flex"
      >
        Scroll to explore
        <span aria-hidden="true" className="flex h-9 w-5 justify-center rounded-full border-2 border-ink/25 pt-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-ink/50" />
        </span>
      </a>
    </section>
  );
}
