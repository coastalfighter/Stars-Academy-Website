/**
 * Frequently asked questions, verbatim from the current STARS site.
 * One source of truth: the FAQ page shows every group, and audience pages
 * (Getting started, Referrals, Careers, Families, Nursing) reuse subsets.
 * Answers that the old site left as "[Client to confirm]" are tracked in
 * docs/CONTENT-CHECKLIST.md.
 */

export type FaqGroupId = "families" | "current" | "partners" | "jobs";

export type Faq = {
  id: string;
  group: FaqGroupId;
  question: string;
  /** Plain-text paragraphs. Kept as text so it can also feed FAQPage JSON-LD. */
  answer: string[];
};

export const faqGroups: { id: FaqGroupId; label: string }[] = [
  { id: "families", label: "For families considering STARS" },
  { id: "current", label: "For current families" },
  { id: "partners", label: "For physicians & referral partners" },
  { id: "jobs", label: "For job seekers" },
];

export const faqs: Faq[] = [
  {
    id: "what-is-stars",
    group: "families",
    question: "What exactly is STARS Academy?",
    answer: [
      "STARS is a pediatric developmental day treatment program in Batesville. Children spend the day with us in developmental classrooms, and speech, occupational and physical therapy and nursing care happen during that same day, with one team working together.",
      "It isn’t just a daycare, and it isn’t a clinic you drive to for a separate appointment. It’s both, designed as one.",
    ],
  },
  {
    id: "ages",
    group: "families",
    question: "What ages does STARS serve?",
    answer: ["STARS serves children from birth to age six."],
  },
  {
    id: "qualify",
    group: "families",
    question: "How do I know if my child qualifies?",
    answer: [
      "Your child is eligible if they have active health insurance, qualify for developmental services plus at least one of speech therapy, occupational therapy, physical therapy or nursing services, and have treatment prescribed by their primary care physician.",
      "You don’t need to figure this out alone — call us or send an inquiry and we’ll walk you through it.",
    ],
  },
  {
    id: "payment",
    group: "families",
    question: "How is STARS paid for? Do you take my insurance?",
    answer: [
      "Day treatment services are paid for through Medicaid funding, including ARKids First-A, SSI and TEFRA. STARS can contact your insurance provider to find out what therapy services your child’s plan covers.",
    ],
  },
  {
    id: "doctor-referral",
    group: "families",
    question: "Do I need a referral from our doctor?",
    answer: [
      "Yes. Treatment at STARS must be prescribed by your child’s primary care physician. If you’re not sure how to start that conversation, we can help.",
    ],
  },
  {
    id: "daycare",
    group: "families",
    question: "Is STARS a daycare?",
    answer: [
      "Not exactly. Children spend the day with us in classrooms, so it can look like a preschool or daycare. But every child at STARS has an individual developmental plan, and licensed therapists and nurses are part of the team all day long.",
    ],
  },
  {
    id: "hours",
    group: "families",
    question: "What are your hours?",
    answer: ["STARS is open Monday through Friday, 7:00 a.m. to 3:00 p.m."],
  },
  {
    id: "transportation",
    group: "families",
    question: "Do you provide transportation?",
    answer: ["STARS operates clinic-owned vans that bring children to and from the clinic."],
  },
  {
    id: "spanish",
    group: "families",
    question: "Do you offer services in Spanish?",
    answer: ["Yes. Speech-language evaluations and therapy are offered in Spanish."],
  },
  {
    id: "visit",
    group: "families",
    question: "Can I visit before deciding?",
    answer: [
      "Absolutely — we encourage it. A tour is the best way to see how STARS works and meet the people who would work with your child. Request a tour online or call us.",
    ],
  },
  {
    id: "how-long",
    group: "families",
    question: "How long does it take to get started?",
    answer: ["It depends on evaluations, your child’s prescription and insurance verification."],
  },
  {
    id: "absence",
    group: "current",
    question: "Who do I contact if my child will be absent?",
    answer: ["Call the main line at 870-793-3200."],
  },
  {
    id: "health-change",
    group: "current",
    question: "My child’s medication or health needs changed. What do I do?",
    answer: [
      "Let our nursing team know as soon as possible so they can update your child’s care plan and coordinate with your child’s health care provider.",
    ],
  },
  {
    id: "who-refers",
    group: "partners",
    question: "Who can refer a child to STARS?",
    answer: [
      "Physicians, therapists, schools, early intervention programs and other professionals can recommend STARS to families, and families can contact us directly. For services to begin, treatment must be prescribed by the child’s primary care physician.",
    ],
  },
  {
    id: "send-referral",
    group: "partners",
    question: "How do I send a referral or prescription?",
    answer: [
      "Call our main line or use the referral contact form and our team will follow up with your office to confirm what we need and how to send it securely.",
    ],
  },
  {
    id: "informed",
    group: "partners",
    question: "Will you keep me informed about my patient?",
    answer: ["Yes. STARS therapists and nurses communicate with each child’s physicians and other professionals as needed."],
  },
  {
    id: "medically-complex",
    group: "partners",
    question: "Can STARS serve medically complex children?",
    answer: [
      "Yes. Full-time licensed nurses are on staff and routinely care for children with needs such as tube feedings, trach care, supplemental oxygen, catheterization, ostomy care and epilepsy.",
    ],
  },
  {
    id: "degree",
    group: "jobs",
    question: "Do I need a degree to work at STARS?",
    answer: [
      "It depends on the role. Developmental technician, van rider and van driver positions require a high school diploma or GED. Early Childhood Developmental Specialists need a four-year degree with an emphasis in early childhood education. Therapy and nursing roles require licensure in your discipline.",
    ],
  },
  {
    id: "application-process",
    group: "jobs",
    question: "What does the application process look like?",
    answer: [
      "Start by telling us a little about yourself online, then complete the official STARS employment application. Our team will contact you about next steps. Some roles require a pre-employment drug screen.",
    ],
  },
];

export const faqsByGroup = (group: FaqGroupId): Faq[] => faqs.filter((f) => f.group === group);

export const faqsById = (ids: readonly string[]): Faq[] =>
  ids.map((id) => faqs.find((f) => f.id === id)).filter((f): f is Faq => Boolean(f));

/** schema.org FAQPage for rich results. */
export function faqSchema(items: readonly Faq[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.join(" ") },
    })),
  };
}
