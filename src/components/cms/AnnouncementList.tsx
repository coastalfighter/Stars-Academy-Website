import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import type { Announcement } from "@/cms/repository";
import { formatDateTime } from "./format";

const ACCENT = { urgent: "border-berry", closure: "border-accent", event: "border-teal", info: "border-ink/30" } as const;

/** Every active announcement (banner or not), e.g. on the current-families page. */
export function AnnouncementList({ items, locale }: { items: Announcement[]; locale: Locale }) {
  const t = getDictionary(locale).cms;
  return (
    <ul className="space-y-4">
      {items.map((a) => (
        <li key={a.id} className={`card border-l-4 p-6 ${ACCENT[a.kind]}`}>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
            {t.kinds[a.kind]}
            {a.endsAt ? (
              <span className="font-semibold normal-case tracking-normal">
                {" "}
                · {t.until} <time dateTime={a.endsAt}>{formatDateTime(a.endsAt, locale)}</time>
              </span>
            ) : null}
          </p>
          <h3 className="mt-2 font-display text-xl" lang={a.title.lang}>
            {a.title.text}
          </h3>
          {a.body ? (
            <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-soft" lang={a.body.lang}>
              {a.body.text}
            </p>
          ) : null}
          {a.link ? (
            <a href={a.link.href} lang={a.link.label.lang} className="mt-3 inline-block font-semibold text-teal-deep underline underline-offset-4">
              {a.link.label.text}
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
