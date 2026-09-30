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
 */
export default function HomePage() {
  return (
    <>
      <ScrollDirector />
      <ScrollRail />
      <Experience />
      <div className="relative z-10">
        <Chapter id="hero">
          <Hero />
          <Pathways />
        </Chapter>
        <Chapter id="care">
          <WhatStars />
        </Chapter>
        <Chapter id="day">
          <DayAtStars />
        </Chapter>
        <Chapter id="services">
          <ServicesScroller />
        </Chapter>
        <Chapter id="approach">
          <Approach />
          <Eligibility />
          <Trust />
        </Chapter>
        <Chapter id="stars">
          <StarsName />
        </Chapter>
        <Chapter id="visit">
          <Referrals />
          <Careers />
          <Visit />
        </Chapter>
      </div>
    </>
  );
}
