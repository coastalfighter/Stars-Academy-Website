import type { Locale, Widen } from "@/i18n/config";

const en = {
  metaTitle: "Current Families",
  metaDescription:
    "Quick answers for families whose children attend STARS Academy: hours, absences, transportation, health and medications, kindergarten transition and who to contact.",
  crumb: "Current families",
  eyebrow: "For current families",
  title: "Everything you need, in one place.",
  lede: "Quick answers for families whose children already attend STARS. Can’t find what you need? Call us — we’re glad to help.",
  resourcesNav: "Resources",
  contactNav: "Who to contact",
  callAbsence: "Call",
  nursingLink: "How our nurses support your child’s health",
  resourcesEyebrow: "Resources",
  resourcesTitle: "Resources for families",
  resources: [
    { title: "Conscious Discipline", body: "The social-emotional approach we use at STARS — with ideas you can try at home." },
    { title: "Our approach, in plain language", body: "What relationships, regulation and neuroaffirming care look like day to day." },
    { title: "STARS on Facebook", body: "Photos, reminders and news from our classrooms." },
  ],
  contactEyebrow: "Who to contact",
  contactTitle: "We’ll get you to the right person.",
  quickEyebrow: "Quick questions",
  quickTitle: "Answers for current families",
  nextTitle: "Have a question we didn’t answer?",
  nextBody: "Send us a message and we’ll route it to the right person.",
  nextCta: "Contact STARS",
  related: [
    { title: "Nursing care", body: "How our nurses support your child’s health." },
    { title: "All FAQs", body: "Answers for families, partners and job seekers." },
  ],
} as const;

const es = {
  metaTitle: "Familias actuales",
  metaDescription:
    "Respuestas rápidas para las familias cuyos hijos asisten a STARS Academy: horario, ausencias, transporte, salud y medicamentos, transición al kínder y a quién contactar.",
  crumb: "Familias actuales",
  eyebrow: "Para familias actuales",
  title: "Todo lo que necesita, en un solo lugar.",
  lede: "Respuestas rápidas para las familias cuyos hijos ya asisten a STARS. ¿No encuentra lo que busca? Llámenos; con gusto le ayudamos.",
  resourcesNav: "Recursos",
  contactNav: "A quién contactar",
  callAbsence: "Llame al",
  nursingLink: "Cómo apoyan nuestros enfermeros la salud de su hijo",
  resourcesEyebrow: "Recursos",
  resourcesTitle: "Recursos para familias",
  resources: [
    { title: "Conscious Discipline (en inglés)", body: "El enfoque socioemocional que usamos en STARS, con ideas que puede probar en casa." },
    { title: "Nuestro enfoque, en palabras sencillas", body: "Cómo se ven las relaciones, la autorregulación y la atención neuroafirmativa en el día a día." },
    { title: "STARS en Facebook", body: "Fotos, recordatorios y noticias de nuestras aulas." },
  ],
  contactEyebrow: "A quién contactar",
  contactTitle: "Le comunicaremos con la persona indicada.",
  quickEyebrow: "Preguntas rápidas",
  quickTitle: "Respuestas para familias actuales",
  nextTitle: "¿Tiene una pregunta que no respondimos?",
  nextBody: "Envíenos un mensaje y lo haremos llegar a la persona indicada.",
  nextCta: "Contactar a STARS",
  related: [
    { title: "Enfermería", body: "Cómo apoyan nuestros enfermeros la salud de su hijo." },
    { title: "Todas las preguntas frecuentes", body: "Respuestas para familias y profesionales." },
  ],
} as const satisfies Widen<typeof en>;

export const familiesCopy: Record<Locale, Widen<typeof en>> = { en, es };
