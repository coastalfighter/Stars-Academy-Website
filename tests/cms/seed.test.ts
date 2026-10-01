import { buildSeed, toNdjson } from "@/cms/seed";
import { faqSchema, jobOpeningSchema } from "@/cms/schemas";
import { faqs } from "@/content/faq";

describe("CMS seed", () => {
  const docs = buildSeed();

  it("uses unique, public (dot-free) document ids", () => {
    const ids = docs.map((d) => d._id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).not.toContain(".");
  });

  it("includes every bundled FAQ with both languages where available", () => {
    const seeded = docs.filter((d) => d._type === "faq");
    expect(seeded).toHaveLength(faqs.length);
    const what = seeded.find((d) => d._id === "faq-what-is-stars") as unknown as { question: { es?: string }; answer: { en: string } };
    expect(what.question.es).toMatch(/Qué es/);
    expect(what.answer.en).toContain("\n\n");
  });

  it("matches what the site expects after the GROQ projection", () => {
    for (const d of docs.filter((x) => x._type === "faq")) {
      const projected = { key: (d.key as { current: string }).current, group: d.group, question: d.question, answer: d.answer };
      expect(faqSchema.safeParse(projected).success).toBe(true);
    }
    for (const d of docs.filter((x) => x._type === "jobOpening")) {
      expect(jobOpeningSchema.safeParse({ ...d, key: d._id }).success).toBe(true);
    }
  });

  it("serialises one document per line", () => {
    expect(toNdjson(docs).trim().split("\n")).toHaveLength(docs.length);
  });
});
