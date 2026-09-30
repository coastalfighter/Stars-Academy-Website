import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";
import { photos } from "@/content/photos";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { AUDIENCES, REASONS } from "@/lib/validation/inquiry";

export const metadata: Metadata = {
  title: "Schedule a Tour",
  description:
    "Visit STARS Academy in Batesville, AR. Tours are relaxed with no commitment — see classrooms and therapy spaces and meet the team.",
  alternates: { canonical: "/schedule-a-tour" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

const EXPECT = [
  "See the classrooms, therapy rooms and therapy gym",
  "Meet teachers, therapists and nurses",
  "Get your questions about eligibility and coverage answered",
  "No commitment, and children are welcome to come along",
] as const;

export default async function ScheduleTourPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const audience = pick(params.audience, AUDIENCES, "family");
  const reason = pick(params.reason, REASONS, "tour");

  return (
    <div className="relative overflow-hidden pt-36 pb-24 md:pt-44">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-32 h-[36rem] w-[36rem] rounded-full bg-gold/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/2 h-[30rem] w-[30rem] rounded-full bg-teal/10 blur-3xl" />

      <div className="container-x relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">Come see for yourself</p>
          <h1 className="display-lg mt-5">Schedule a tour or start a conversation.</h1>
          <p className="lede mt-5">
            You don’t need to have everything figured out before you contact us. Tell us how to reach you and someone
            from our team will follow up within one business day.
          </p>

          <ul className="mt-8 space-y-3">
            {EXPECT.map((item) => (
              <li key={item} className="flex gap-3">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-6 w-6 shrink-0 text-teal">
                  <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.15" />
                  <path d="m7 12.5 3.2 3L17 8.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]">
            <Image
              src={photos.classroomPlay.src}
              alt={photos.classroomPlay.alt}
              width={photos.classroomPlay.width}
              height={photos.classroomPlay.height}
              sizes="(min-width: 1024px) 480px, 100vw"
              className="h-auto w-full"
              priority
            />
          </div>

          <address className="card mt-8 p-6 not-italic leading-relaxed">
            <strong className="font-display text-lg">STARS Academy</strong>
            <br />
            <a href={site.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {site.address.street}, {site.address.city}, {site.address.region} {site.address.postalCode}
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
            <br />
            {site.hours.display}
            <br />
            <a href={site.phone.href} className="font-semibold">
              {site.phone.display}
            </a>
          </address>
        </div>

        <div className="lg:col-span-7">
          <InquiryForm defaultAudience={audience} defaultReason={reason} />
        </div>
      </div>
    </div>
  );
}
