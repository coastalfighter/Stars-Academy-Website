import { faqGroups, faqs, faqsByGroup, faqsById, faqSchema } from "@/content/faq";

describe("FAQ content", () => {
  it("has unique ids and no unconfirmed placeholders", () => {
    expect(new Set(faqs.map((f) => f.id)).size).toBe(faqs.length);
    for (const f of faqs) {
      expect(f.answer.join(" ")).not.toMatch(/client to confirm|\[|\]/i);
      expect(f.answer.length).toBeGreaterThan(0);
    }
  });

  it("puts at least one question in every group", () => {
    for (const g of faqGroups) expect(faqsByGroup(g.id).length).toBeGreaterThan(0);
  });

  it("looks up by id and skips unknown ids", () => {
    expect(faqsById(["ages", "nope"]).map((f) => f.id)).toEqual(["ages"]);
  });

  it("produces a valid FAQPage schema", () => {
    const schema = faqSchema(faqsByGroup("jobs")) as { "@type": string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity[0]?.name).toMatch(/degree/i);
    expect(schema.mainEntity[0]?.acceptedAnswer.text.length).toBeGreaterThan(20);
  });
});
