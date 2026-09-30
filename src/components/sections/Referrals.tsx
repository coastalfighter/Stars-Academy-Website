import { referralCriteria, referralFacts, site } from "@/content/site";
import { services } from "@/content/services";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Referrals() {
  return (
    <section id="referrals" aria-labelledby="referrals-title" className="relative z-10 scroll-mt-24 bg-sand py-28 lg:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="eyebrow">For physicians, therapists &amp; schools</p>
            <h2 id="referrals-title" className="display-lg mt-5">
              A clear path to refer a child.
            </h2>
            <p className="lede mt-5">
              Everything you need before referring: who we serve, eligibility, the conditions our nurses and therapists
              routinely support, and exactly how to start.
            </p>
          </Reveal>

          <Reveal className="mt-8">
            <h3 className="font-display text-xl">Referral criteria</h3>
            <p className="mt-2 text-ink-soft">A child is eligible for services at STARS when they:</p>
            <ol className="mt-4 space-y-3">
              {referralCriteria.map((c, i) => (
                <li key={c} className="flex gap-3 leading-relaxed">
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink text-sm font-bold text-gold">
                    {i + 1}
                  </span>
                  {c}
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/referrals#make-referral" size="lg" arrow>
              Start a referral
            </ButtonLink>
            <ButtonLink href={site.phone.href} size="lg" variant="ghost">
              {site.phone.display}
            </ButtonLink>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal className="card overflow-hidden">
            <h3 className="border-b border-line bg-cream px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-muted">
              STARS at a glance
            </h3>
            <dl className="divide-y divide-line">
              {referralFacts.map((f) => (
                <div key={f.label} className="grid gap-1 px-7 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <dt className="font-semibold">{f.label}</dt>
                  <dd className="text-ink-soft">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="mt-6">
            <h3 className="font-display text-xl">Clinical scope</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {services
                .filter((s) => s.scope)
                .map((s) => (
                  <details key={s.slug} className="group card p-5 open:shadow-[var(--shadow-lift)]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-3">
                        <span aria-hidden="true" className="h-2.5 w-2.5 rotate-45 rounded-[2px]" style={{ background: s.color }} />
                        {s.name}
                      </span>
                      <span aria-hidden="true" className="text-xl leading-none text-muted transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-ink-soft">
                      {s.scope?.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
