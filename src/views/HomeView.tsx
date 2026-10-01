import type { Locale } from "@/i18n/config";
import { Experience } from "@/components/three/Experience";
import { ScrollDirector } from "@/components/providers/ScrollDirector";
import { ScrollRail } from "@/components/ui/ScrollRail";
import { Chapter } from "@/components/sections/Chapter";
import { Hero } from "@/components/sections/Hero";
import { Pathways } from "@/components/sections/Pathways";
import { WhatStars } from "@/components/sections/WhatStars";
import { DayAtStars } from "@/components/sections/DayAtStars";
import { ServicesScroller } from "@/components/sections/ServicesScroller";
import { Approach } from "@/components/sections/Approach";
import { Eligibility } from "@/components/sections/Eligibility";
import { Trust } from "@/components/sections/Trust";
import { StarsName } from "@/components/sections/StarsName";
import { Referrals } from "@/components/sections/Referrals";
import { Careers } from "@/components/sections/Careers";
import { Visit } from "@/components/sections/Visit";

/**
 * Home — a single scroll story in seven chapters. The fixed 3D layer
 * (<Experience/>) reads chapter progress published by <ScrollDirector/>.
 * Identical structure in every language, so the 3D timing matches.
 */
export function HomeView({ locale }: { locale: Locale }) {
  return (
    <>
      <ScrollDirector />
      <ScrollRail />
      <Experience />
      <div className="relative z-10">
        <Chapter id="hero">
          <Hero locale={locale} />
          <Pathways locale={locale} />
        </Chapter>
        <Chapter id="care">
          <WhatStars locale={locale} />
        </Chapter>
        <Chapter id="day">
          <DayAtStars locale={locale} />
        </Chapter>
        <Chapter id="services">
          <ServicesScroller locale={locale} />
        </Chapter>
        <Chapter id="approach">
          <Approach locale={locale} />
          <Eligibility locale={locale} />
          <Trust locale={locale} />
        </Chapter>
        <Chapter id="stars">
          <StarsName locale={locale} />
        </Chapter>
        <Chapter id="visit">
          <Referrals locale={locale} />
          <Careers locale={locale} />
          <Visit locale={locale} />
        </Chapter>
      </div>
    </>
  );
}
