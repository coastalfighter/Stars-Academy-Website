import type { Locale, Widen } from "@/i18n/config";

const en = {
  metaTitle: "Frequently Asked Questions",
  metaDescription:
    "Answers about STARS Academy: eligibility, Medicaid funding, hours, transportation, Spanish services, referrals and careers.",
  crumb: "FAQ",
  eyebrow: "FAQ",
  title: "Questions, answered plainly.",
  ledeBefore: "Can’t find what you’re looking for? Call us at",
  ledeAfter: "— we’re happy to help.",
  topics: "FAQ topics",
  nextTitle: "Still have a question?",
  nextBody: "Send us a message and we’ll route it to the right person — or come see STARS for yourself.",
  nextContact: "Contact STARS",
  nextTour: "Schedule a tour",
} as const;

const es = {
  metaTitle: "Preguntas frecuentes",
  metaDescription:
    "Respuestas sobre STARS Academy: elegibilidad, financiamiento de Medicaid, horario, transporte, servicios en español y más.",
  crumb: "Preguntas frecuentes",
  eyebrow: "Preguntas frecuentes",
  title: "Preguntas, respondidas con claridad.",
  ledeBefore: "¿No encuentra lo que busca? Llámenos al",
  ledeAfter: "; con gusto le ayudamos.",
  topics: "Temas de preguntas frecuentes",
  nextTitle: "¿Todavía tiene una pregunta?",
  nextBody: "Envíenos un mensaje y lo haremos llegar a la persona indicada, o venga a conocer STARS en persona.",
  nextContact: "Contactar a STARS",
  nextTour: "Programar una visita",
} as const satisfies Widen<typeof en>;

export const faqCopy: Record<Locale, Widen<typeof en>> = { en, es };
