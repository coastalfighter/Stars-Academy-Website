import Image from "next/image";
import { careerRoles } from "@/content/site";
import { photos } from "@/content/photos";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const WHY = [
  { title: "A true interdisciplinary team", body: "Speech, occupational and physical therapists, nurses and classroom teams work under one roof, around the same children — every day." },
  { title: "Time to really know each child", body: "Children spend the whole day at STARS. Your work carries over into real moments — play, meals, movement." },
  { title: "A culture that takes care of adults, too", body: "Our Adult First mindset recognizes that caring well for children starts with the adults who do it." },
] as const;

export function Careers() {
  return (
    <section id="careers" aria-labelledby="careers-title" className="relative z-10 scroll-mt-24 bg-ink py-28 text-cream lg:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="eyebrow !text-gold">Careers</p>
            <h2 id="careers-title" className="display-lg mt-5">
              Do the work you trained for, <span className="text-gold">with a team behind you.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-cream/75">
              Therapists, nurses and educators at STARS work side by side, every day, around the same children. If
              that’s the kind of practice you’ve been looking for, we’d love to meet you.
            </p>
          </Reveal>
          <ul className="mt-10 space-y-5">
            {WHY.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i * 80} className="border-l-2 border-gold/60 pl-5">
                <h3 className="font-display text-xl">{w.title}</h3>
                <p className="mt-1.5 leading-relaxed text-cream/70">{w.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <Reveal className="overflow-hidden rounded-[var(--radius-card)]">
            <Image
              src={photos.ballPit.src}
              alt={photos.ballPit.alt}
              width={photos.ballPit.width}
              height={photos.ballPit.height}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
          <h3 className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-cream/60">We hire for these roles on an ongoing basis</h3>
          <ul className="mt-4 divide-y divide-cream/10 rounded-[var(--radius-card)] border border-cream/10">
            {careerRoles.map((r) => (
              <li key={r.title} className="flex flex-col gap-1 p-5">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{r.team}</span>
                <span className="font-display text-lg">{r.title}</span>
                <span className="text-sm text-cream/65">{r.requirement}</span>
              </li>
            ))}
          </ul>
          <Reveal className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/careers/apply" variant="secondary" size="lg" arrow>
                Apply now
              </ButtonLink>
              <ButtonLink href="/careers" variant="light" size="lg">
                Explore careers
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
