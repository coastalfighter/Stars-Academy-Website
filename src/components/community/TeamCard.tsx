import Image from "next/image";
import type { TeamMember } from "@/cms/repository";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Staff card. A photo shows only when the person agreed; otherwise their initials. */
export function TeamCard({ member, spanishLabel, spanishText }: { member: TeamMember; spanishLabel: string; spanishText: string }) {
  return (
    <article className="card flex h-full gap-5 p-6">
      {member.photo ? (
        <Image
          src={member.photo.url}
          alt=""
          width={member.photo.width}
          height={member.photo.height}
          sizes="96px"
          className="h-24 w-24 shrink-0 rounded-2xl object-cover"
          {...(member.photo.lqip ? { placeholder: "blur" as const, blurDataURL: member.photo.lqip } : {})}
        />
      ) : (
        <div aria-hidden="true" className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-sky font-display text-3xl text-blue-deep">
          {initials(member.name)}
        </div>
      )}
      <div className="min-w-0">
        <h4 className="font-display text-xl leading-snug">
          {member.name}
          {member.credentials ? <span className="text-base text-muted">, {member.credentials}</span> : null}
        </h4>
        <p className="mt-1 font-semibold text-teal-deep" lang={member.role.lang}>
          {member.role.text}
        </p>
        {member.speaksSpanish ? (
          <p className="mt-2">
            <span className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-ink" lang="es-US" aria-label={spanishLabel}>
              {spanishText}
            </span>
          </p>
        ) : null}
        {member.bio ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft" lang={member.bio.lang}>
            {member.bio.text}
          </p>
        ) : null}
      </div>
    </article>
  );
}
