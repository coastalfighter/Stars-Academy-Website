import type { Faq } from "@/content/faq";
import { faqSchema } from "@/content/faq";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * Accessible accordion using native <details>/<summary> — keyboard and
 * screen-reader support for free, and every answer is in the HTML for search.
 */
export function FaqList({ items, schema = false }: { items: readonly Faq[]; schema?: boolean }) {
  return (
    <>
      <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper shadow-[var(--shadow-soft)]">
        {items.map((f) => (
          <details key={f.id} id={`faq-${f.id}`} className="group scroll-mt-28">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 px-6 py-5 font-display text-lg leading-snug transition-colors hover:bg-cream sm:px-8 [&::-webkit-details-marker]:hidden">
              {f.question}
              <span
                aria-hidden="true"
                className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream font-sans text-lg leading-none text-teal-deep transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="space-y-3 px-6 pb-6 leading-relaxed text-ink-soft sm:px-8">
              {f.answer.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
      {schema ? <JsonLd data={faqSchema(items)} /> : null}
    </>
  );
}
