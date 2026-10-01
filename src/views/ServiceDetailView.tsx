import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { hasLocale, href, serviceHref } from "@/i18n/routes";
import { getContent, findService } from "@/content";
import { faqsByKeys, getFaqs } from "@/cms/repository";
import type { ServiceSlug } from "@/content/services";
import { considerHeading, servicesCopy, whatIsHeading } from "@/content/copy/services";
import { site as enSite } from "@/content/site";
import { ButtonLink, Arrow } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/page/PageHero";
import { FaqList } from "@/components/page/FaqList";

/** One discipline's page. Rendered for every service in every language. */
export async function ServiceDetailView({ locale, slug }: { locale: Locale; slug: ServiceSlug }) {
  const c = getContent(locale);
  const t = servicesCopy[locale].detail;
  const d = getDictionary(locale);
  const service = findService(c, slug);
  if (!service) return null;
  const nursingFaqs = service.slug === "nursing-care" ? faqsByKeys(await getFaqs(locale), ["medically-complex"]) : [];

  const index = c.services.findIndex((s) => s.slug === service.slug);
  const next = c.services[(index + 1) % c.services.length];
  const toEnglish = hasLocale("referrals", locale) ? undefined : "en-US";

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: service.name,
          inLanguage: locale === "es" ? "es-US" : "en-US",
          about: { "@type": "MedicalTherapy", name: service.name, description: service.what },
          audience: "https://schema.org/Patient",
          url: `${enSite.url}${serviceHref(locale, service.slug)}`,
          provider: { "@id": `${enSite.url}/#organization` },
        }}
      />

      <PageHero
        locale={locale}
        crumbs={[
          { label: servicesCopy[locale].index.crumb, href: href(locale, "services") },
          { label: service.name, href: serviceHref(locale, service.slug) },
        ]}
        eyebrow={service.eyebrow}
        title={service.headline}
        lede={service.intro}
        star={index}
        actions={
          <>
            <ButtonLink href={href(locale, "gettingStarted")} size="lg" arrow>
              {t.qualify}
            </ButtonLink>
            <ButtonLink href={href(locale, "tour")} size="lg" variant="ghost">
              {t.tour}
            </ButtonLink>
          </>
        }
      />

      <section aria-labelledby="what-heading" className="bg-paper py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 id="what-heading" className="display-md">
              {whatIsHeading(locale, service.name)}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">{service.what}</p>
          </Reveal>
          <Reveal>
            <div className="rounded-[var(--radius-card)] border-l-4 bg-cream p-8" style={{ borderColor: service.color }}>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{t.whoFor}</h2>
              <p className="mt-3 font-display text-xl leading-snug">{service.whoFor}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="signals-heading" className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <h2 id="signals-heading" className="display-md">
                {considerHeading(locale, service.name)}
              </h2>
              <p className="mt-3 text-ink-soft">{t.considerNote}</p>
            </Reveal>
            <ul className="mt-6 space-y-3">
              {service.signals.map((s) => (
                <Reveal as="li" key={s} className="card flex gap-4 p-5">
                  <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px]" style={{ background: service.color }} />
                  <span className="leading-relaxed">{s}</span>
                </Reveal>
              ))}
            </ul>
          </div>
          <div>
            <Reveal>
              <h2 className="display-md">{t.receives}</h2>
            </Reveal>
            <ul className="mt-6 space-y-3">
              {service.provides.map((s) => (
                <Reveal as="li" key={s} className="flex gap-3 leading-relaxed">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-6 w-6 shrink-0 text-accent-deep">
                    <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
                    <path d="m7 12.5 3.2 3L17 8.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {s}
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="bg-ink py-20 text-cream">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow !text-accent">{t.howEyebrow}</p>
            <h2 id="how-heading" className="display-md mt-4">
              {t.howTitle}
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {service.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 80} className="rounded-[var(--radius-card)] border border-cream/10 p-6">
                <span className="font-display text-4xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-xl">
                  <span className="sr-only">
                    {d.common.step} {i + 1}:{" "}
                  </span>
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-cream/75">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="expect-heading" className="py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <h2 id="expect-heading" className="display-md">
                {t.countOn}
              </h2>
            </Reveal>
            <ul className="mt-6 space-y-3">
              {service.expectations.map((e) => (
                <Reveal as="li" key={e} className="card p-5 leading-relaxed">{e}</Reveal>
              ))}
            </ul>
          </div>
          <div>
            <Reveal>
              <h2 className="display-md">{t.oneTeam}</h2>
            </Reveal>
            <ul className="mt-6 space-y-3">
              {service.connects.map((link) => {
                const other = findService(c, link.with);
                if (!other) return null;
                return (
                  <Reveal as="li" key={link.with}>
                    <Link href={serviceHref(locale, other.slug)} className="group card flex flex-col gap-2 p-5 transition-transform hover:-translate-y-0.5">
                      <span className="flex items-center gap-2 font-semibold">
                        <span aria-hidden="true" className="h-2.5 w-2.5 rotate-45 rounded-[2px]" style={{ background: other.color }} />
                        {other.name}
                      </span>
                      <span className="text-ink-soft">{link.body}</span>
                    </Link>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {service.scope ? (
        <section aria-labelledby="scope-heading" className="bg-sand py-20">
          <div className="container-x">
            <Reveal>
              <p className="eyebrow">{t.scopeEyebrow}</p>
              <h2 id="scope-heading" className="display-md mt-4">
                {t.scopeTitle}
              </h2>
            </Reveal>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {service.scope.map((s) => (
                <li key={s} className="rounded-2xl bg-paper p-4 leading-snug shadow-[var(--shadow-soft)]">{s}</li>
              ))}
            </ul>
            <ButtonLink href={href(locale, "referrals")} hrefLang={toEnglish} variant="ghost" className="mt-8" arrow>
              {t.howToRefer}
            </ButtonLink>
          </div>
        </section>
      ) : null}

      {nursingFaqs.length > 0 ? (
        <section aria-labelledby="svc-faq-title" className="py-20">
          <div className="container-x grid gap-10 lg:grid-cols-12">
            <h2 id="svc-faq-title" className="display-md lg:col-span-4">
              {t.nursingFaqTitle}
            </h2>
            <div className="lg:col-span-8">
              <FaqList items={nursingFaqs} />
            </div>
          </div>
        </section>
      ) : null}

      {next ? (
        <section aria-label={t.nextService} className="py-16">
          <div className="container-x">
            <Link href={serviceHref(locale, next.slug)} className="group card flex items-center justify-between gap-6 p-8 transition-transform hover:-translate-y-1">
              <span className="min-w-0">
                <span className="text-sm font-semibold text-muted">{t.nextService}</span>
                <span className="mt-1 block font-display text-3xl">{next.name}</span>
              </span>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink" style={{ background: next.color }}>
                <Arrow />
              </span>
            </Link>
          </div>
        </section>
      ) : null}
    </article>
  );
}
