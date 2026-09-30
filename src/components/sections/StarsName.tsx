import { site } from "@/content/site";
import { Reveal } from "@/components/ui/Reveal";

const COLORS = ["text-gold-deep", "text-coral-deep", "text-teal-deep", "text-blue-deep", "text-berry"] as const;

/** "Our name is our promise" — the 3D blocks stack into S·T·A·R·S above this copy. */
export function StarsName() {
  return (
    <section aria-labelledby="name-title" className="relative flex min-h-[150vh] flex-col justify-between py-28 lg:py-32">
      <div className="container-x">
        <Reveal className="over-scene mx-auto max-w-2xl text-center">
          <p className="eyebrow">Our name is our promise</p>
          <h2 id="name-title" className="display-md mt-4">
            Every child, every day.
          </h2>
        </Reveal>
      </div>

      <div className="container-x">
        <Reveal className="over-scene mx-auto max-w-4xl text-center">
          <p className="font-display text-[clamp(1.9rem,4.4vw,3.6rem)] leading-tight" aria-label={site.acronym.join(" ")}>
            {site.acronym.map((word, i) => (
              <span key={word} aria-hidden="true" className="mr-[0.25em] inline-block">
                <span className={COLORS[i]}>{word[0]}</span>
                {word.slice(1)}
              </span>
            ))}
          </p>
          <p className="lede mx-auto mt-6 max-w-2xl">
            Success looks different for every child — a first word, a first step, a calm goodbye at drop-off. We build
            it one block at a time.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
