import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

const TONES = {
  cream: "",
  paper: "bg-white/55",
  sand: "bg-white/30",
  ink: "bg-ink text-cream",
} as const;

export type Tone = keyof typeof TONES;

type SectionProps = {
  id?: string;
  tone?: Tone;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, tone = "cream", labelledBy, className = "", children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`relative scroll-mt-28 py-20 md:py-28 ${TONES[tone]} ${className}`}>
      <div className="container-x">{children}</div>
    </section>
  );
}

type IntroProps = {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: Tone;
  align?: "left" | "center";
};

/** Eyebrow + h2 + lede. `id` goes on the h2 so sections can be aria-labelledby it. */
export function SectionIntro({ id, eyebrow, title, lede, tone = "cream", align = "left" }: IntroProps) {
  const dark = tone === "ink";
  return (
    <Reveal className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? <p className={`eyebrow ${dark ? "!text-accent" : ""}`}>{eyebrow}</p> : null}
      <h2 id={id} className="display-lg mt-4">
        {title}
      </h2>
      {lede ? <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-cream/75" : "text-ink-soft"}`}>{lede}</p> : null}
    </Reveal>
  );
}
