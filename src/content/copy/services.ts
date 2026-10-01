import type { Locale, Widen } from "@/i18n/config";

const en = {
  index: {
    metaTitle: "Services — Therapy, Nursing & Developmental Classrooms",
    metaDescription:
      "Five disciplines, one coordinated plan: developmental classrooms, speech, occupational and physical therapy, and on-site nursing for children birth to 6 in Batesville, AR.",
    crumb: "Services",
    eyebrow: "Services",
    title: "Five disciplines. One coordinated plan.",
    lede: "Every child at STARS spends the day in a developmental classroom, with the therapy and nursing care they need woven into that same day. Here’s how each part works — and how they work together.",
    togetherEyebrow: "Why it works better together",
    togetherTitle: "Children don’t grow in separate boxes. Their care shouldn’t either.",
    listEyebrow: "Our services",
    listTitle: "Explore each service.",
    learnMoreAbout: "about",
    fundingEyebrow: "Funding",
    fundingTitle: "How services are paid for",
    fundingPrefix: "Day treatment services are paid for through",
    fundingBody: "STARS can contact your insurance provider to find out what therapy services your child’s plan covers.",
    prescription: "Treatment must be prescribed by your child’s primary care physician.",
    fundingCta: "Eligibility & enrollment",
    nextTitle: "Not sure which services your child needs?",
    nextBody: "You don’t have to know. Tell us what you’re noticing, and we’ll help you figure out the right next step.",
    nextStart: "Start a conversation",
    nextTour: "Schedule a tour",
    related: [
      { title: "Our approach", body: "The philosophy behind how we work with children." },
      { title: "For referral partners", body: "Eligibility and how to refer a child." },
    ],
  },
  detail: {
    metaSuffix: "for Children in Batesville, AR",
    qualify: "See if your child qualifies",
    tour: "Schedule a tour",
    whoFor: "Who it’s for",
    considerNote: "These are common reasons families reach out. You don’t need a diagnosis to ask us a question.",
    receives: "What your child receives here",
    howEyebrow: "How it works",
    howTitle: "From first conversation to everyday progress.",
    countOn: "What you can count on",
    oneTeam: "One team around your child",
    scopeEyebrow: "For physicians & referral partners",
    scopeTitle: "Conditions and care we routinely support",
    howToRefer: "How to refer a child",
    nursingFaqTitle: "Common questions about nursing care",
    nextService: "Next service",
  },
} as const;

const es = {
  index: {
    metaTitle: "Servicios: terapia, enfermería y aulas de desarrollo",
    metaDescription:
      "Cinco disciplinas, un plan coordinado: aulas de desarrollo, terapia del habla y lenguaje, terapia ocupacional y física, y enfermería en el centro para niños de 0 a 6 años en Batesville, AR.",
    crumb: "Servicios",
    eyebrow: "Servicios",
    title: "Cinco disciplinas. Un plan coordinado.",
    lede: "Cada niño en STARS pasa el día en un aula de desarrollo, con la terapia y la enfermería que necesita integradas en ese mismo día. Así funciona cada parte, y así trabajan juntas.",
    togetherEyebrow: "Por qué funciona mejor en conjunto",
    togetherTitle: "Los niños no crecen en compartimentos separados. Su atención tampoco debería estarlo.",
    listEyebrow: "Nuestros servicios",
    listTitle: "Conozca cada servicio.",
    learnMoreAbout: "sobre",
    fundingEyebrow: "Financiamiento",
    fundingTitle: "Cómo se pagan los servicios",
    fundingPrefix: "Los servicios de tratamiento diurno se pagan con",
    fundingBody: "STARS puede comunicarse con su proveedor de seguro para saber qué servicios de terapia cubre el plan de su hijo.",
    prescription: "El tratamiento debe ser recetado por el médico de cabecera de su hijo.",
    fundingCta: "Elegibilidad e inscripción",
    nextTitle: "¿No sabe qué servicios necesita su hijo?",
    nextBody: "No tiene que saberlo. Cuéntenos lo que está notando y le ayudaremos a encontrar el siguiente paso.",
    nextStart: "Iniciar una conversación",
    nextTour: "Programar una visita",
    related: [
      { title: "Nuestro enfoque", body: "La filosofía detrás de cómo trabajamos con los niños." },
      { title: "Para profesionales de salud (en inglés)", body: "Elegibilidad y cómo referir a un niño." },
    ],
  },
  detail: {
    metaSuffix: "para niños en Batesville, AR",
    qualify: "Vea si su hijo califica",
    tour: "Programar una visita",
    whoFor: "Para quién es",
    considerNote: "Estas son razones comunes por las que las familias se comunican con nosotros. No necesita un diagnóstico para hacernos una pregunta.",
    receives: "Lo que su hijo recibe aquí",
    howEyebrow: "Cómo funciona",
    howTitle: "De la primera conversación al progreso de cada día.",
    countOn: "Con lo que puede contar",
    oneTeam: "Un solo equipo en torno a su hijo",
    scopeEyebrow: "Para médicos y profesionales que refieren",
    scopeTitle: "Condiciones y cuidados que atendemos de forma habitual",
    howToRefer: "Cómo referir a un niño (en inglés)",
    nursingFaqTitle: "Preguntas comunes sobre enfermería",
    nextService: "Siguiente servicio",
  },
} as const satisfies Widen<typeof en>;

export const servicesCopy: Record<Locale, Widen<typeof en>> = { en, es };

/**
 * "What is speech therapy?" reads naturally in English; Spanish needs the
 * article to agree with the service name ("¿Qué es la terapia…?" /
 * "¿Qué son las aulas…?" / "¿Qué es la enfermería?").
 */
export function whatIsHeading(locale: Locale, name: string): string {
  if (locale === "en") return `What is ${name.toLowerCase()}?`;
  const lower = name.charAt(0).toLowerCase() + name.slice(1);
  if (lower.startsWith("aulas")) return `¿Qué son las ${lower}?`;
  return `¿Qué es la ${lower}?`;
}

export function considerHeading(locale: Locale, name: string): string {
  if (locale === "en") return `You might consider ${name.toLowerCase()} if…`;
  const lower = name.charAt(0).toLowerCase() + name.slice(1);
  if (lower.startsWith("aulas")) return `Podría considerar las ${lower} si…`;
  return `Podría considerar la ${lower} si…`;
}
