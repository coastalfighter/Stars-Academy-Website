import Image from "next/image";
import { approachPrinciples } from "@/content/site";
import { photos } from "@/content/photos";
import { Reveal } from "@/components/ui/Reveal";

const ACCENTS = ["bg-gold", "bg-coral", "bg-teal", "bg-blue"] as const;

export function Approach() {
  return (
    <section id="approach" aria-labelledby="approach-title" className="relative scroll-mt-24 py-28 lg:py-40">
      <div className="container-x">
        <div className="over-scene copy-col lg:max-w-[600px]">
          <Reveal>
            <p className="eyebrow">Our approach</p>
            <h2 id="approach-title" className="display-lg mt-5">
              Children learn best when they feel safe, connected and understood.
            </h2>
            <p className="lede mt-5">
              So that’s where we start. Our culture is shaped by{" "}
              <a
                href="https://consciousdiscipline.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-teal-deep underline decoration-2 underline-offset-4"
              >
                Conscious Discipline<span className="sr-only"> (opens in a new tab)</span>
              </a>
              , an Adult First mindset, and sensory-informed, neuroaffirming care. Here’s what that means — in everyday
              words.
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {approachPrinciples.map((item, i) => (
              <Reveal as="li" key={item.title} delay={i * 80} className="card p-6">
                <span aria-hidden="true" className={`block h-1.5 w-10 rounded-full ${ACCENTS[i]}`} />
                <h3 className="mt-4 font-display text-xl leading-snug">{item.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{item.body}</p>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-10 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={photos.floorGame.src}
              alt={photos.floorGame.alt}
              width={photos.floorGame.width}
              height={photos.floorGame.height}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="h-auto w-full"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
