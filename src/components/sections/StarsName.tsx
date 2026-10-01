import type { Locale } from "@/i18n/config";
import { getContent } from "@/content";
import { homeCopy } from "@/content/copy/home";
import { Reveal } from "@/components/ui/Reveal";
import { FlatLetterBlocks, InlineSlot } from "@/components/three/SceneSlot";

const COLORS = ["text-pink-deep", "text-lilac-deep", "text-accent-deep", "text-azure-deep", "text-rose-deep"] as const;

/** "Our name is our promise": the S·T·A·R·S blocks land in the slot between the title and the acronym. */
export function StarsName({ locale }: { locale: Locale }) {
  const t = homeCopy[locale].name;
  const { site } = getContent(locale);
  return (
    <section aria-labelledby="name-title" className="relative py-28 lg:py-36">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="name-title" className="display-md mt-4">
            {t.title}
          </h2>
        </Reveal>
      </div>

      <InlineSlot name="stars" className="container-x my-10 h-[30svh] min-h-40 max-h-80">
        <FlatLetterBlocks letters={site.acronym.map((word) => word[0] ?? "")} />
      </InlineSlot>

      <div className="container-x">
        <Reveal className="mx-auto max-w-4xl text-center">
          {/* The acronym is the organization's English name, so it is marked as English for screen readers. */}
          <p lang="en-US" className="font-display text-[clamp(1.9rem,4.4vw,3.6rem)] leading-tight">
            <span className="sr-only">{site.acronym.join(" ")}</span>
            {site.acronym.map((word, i) => (
              <span key={word} aria-hidden="true" className="mr-[0.25em] inline-block">
                <span className={COLORS[i]}>{word[0]}</span>
                {word.slice(1)}
              </span>
            ))}
          </p>
          {site.acronymMeaning ? <p className="mt-3 font-display text-xl text-ink-soft">“{site.acronymMeaning}”</p> : null}
          <p className="lede mx-auto mt-6 max-w-2xl">{t.lede}</p>
        </Reveal>
      </div>
    </section>
  );
}
