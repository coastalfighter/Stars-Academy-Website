import { faqs as enFaqs } from "@/content/faq";
import { faqs as esFaqs } from "@/content/es/faq";
import { openRoles } from "@/content/pages";

/**
 * Builds the initial CMS dataset from the content bundled with the site, so
 * staff start from today's text instead of an empty CMS. Output is NDJSON for
 * `sanity dataset import`. IDs contain no dots: dotted IDs are private in Sanity.
 */
export type SeedDoc = { _id: string; _type: string } & Record<string, unknown>;

const join = (paragraphs: readonly string[] | undefined) => (paragraphs?.length ? paragraphs.join("\n\n") : undefined);

export function buildSeed(): SeedDoc[] {
  const docs: SeedDoc[] = [];

  enFaqs.forEach((f, i) => {
    const es = esFaqs.find((e) => e.id === f.id);
    docs.push({
      _id: `faq-${f.id}`,
      _type: "faq",
      group: f.group,
      key: { _type: "slug", current: f.id },
      order: (i + 1) * 10,
      question: { _type: "localeString", en: f.question, ...(es ? { es: es.question } : {}) },
      answer: { _type: "localeText", en: join(f.answer), ...(es ? { es: join(es.answer) } : {}) },
    });
  });

  openRoles.forEach((r, i) => {
    docs.push({
      _id: `job-${r.id}`,
      _type: "jobOpening",
      title: r.title,
      team: r.team,
      body: r.body,
      requirements: [...r.requirements],
      position: r.id,
      open: true,
      order: (i + 1) * 10,
    });
  });

  // Empty singleton so "Contact details" opens ready to fill in.
  docs.push({ _id: "siteSettings", _type: "siteSettings" });
  return docs;
}

export const toNdjson = (docs: SeedDoc[]): string => `${docs.map((d) => JSON.stringify(d)).join("\n")}\n`;
