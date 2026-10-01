import type { Locale, Widen } from "@/i18n/config";

const en = {
  contact: {
    metaTitle: "Contact STARS Academy",
    metaDescription:
      "Call, visit or send a message to STARS Academy, 200 General St., Batesville, AR. Monday – Friday, 7:00 a.m. – 3:00 p.m.",
    crumb: "Contact",
    eyebrow: "Contact",
    title: "We’re here to help.",
    lede: "Call, visit or send a message — we’ll make sure it reaches the right person.",
    quick: [
      { q: "Interested in STARS for your child?", label: "Getting started" },
      { q: "Want to see STARS in person?", label: "Schedule a tour" },
      { q: "Referring a patient or student?", label: "Referral information" },
      { q: "Looking for a job?", label: "Careers" },
    ],
    direct: "Reach us directly",
    who: "Who handles what",
    sendMessage: "Send a message",
    submit: "Send message",
  },
  tour: {
    metaTitle: "Schedule a Tour",
    metaDescription:
      "Visit STARS Academy in Batesville, AR. Tours are relaxed with no commitment — see classrooms and therapy spaces and meet the team.",
    eyebrow: "Come see for yourself",
    title: "Schedule a tour or start a conversation.",
    lede: "You don’t need to have everything figured out before you contact us. Tell us how to reach you and someone from our team will follow up within one business day.",
    expect: [
      "See the classrooms, therapy rooms and therapy gym",
      "Meet teachers, therapists and nurses",
      "Get your questions about eligibility and coverage answered",
      "Relaxed, with no commitment",
    ],
  },
} as const;

const es = {
  contact: {
    metaTitle: "Contacto de STARS Academy",
    metaDescription:
      "Llame, visite o envíe un mensaje a STARS Academy, 200 General St., Batesville, AR. Lunes a viernes, de 7:00 a. m. a 3:00 p. m.",
    crumb: "Contacto",
    eyebrow: "Contacto",
    title: "Estamos aquí para ayudarle.",
    lede: "Llame, visítenos o envíe un mensaje; nos aseguraremos de que llegue a la persona indicada.",
    quick: [
      { q: "¿Le interesa STARS para su hijo?", label: "Cómo empezar" },
      { q: "¿Quiere conocer STARS en persona?", label: "Programar una visita" },
      { q: "¿Va a referir a un paciente o estudiante?", label: "Información para referir (en inglés)" },
      { q: "¿Busca empleo?", label: "Empleos (en inglés)" },
    ],
    direct: "Comuníquese directamente",
    who: "Quién atiende cada tema",
    sendMessage: "Enviar un mensaje",
    submit: "Enviar mensaje",
  },
  tour: {
    metaTitle: "Programar una visita",
    metaDescription:
      "Visite STARS Academy en Batesville, AR. Las visitas son tranquilas y sin compromiso: vea las aulas y los espacios de terapia y conozca al equipo.",
    eyebrow: "Venga a conocernos",
    title: "Programe una visita o inicie una conversación.",
    lede: "No necesita tener todo resuelto antes de comunicarse con nosotros. Díganos cómo comunicarnos con usted y alguien de nuestro equipo le responderá en un plazo de un día hábil.",
    expect: [
      "Vea las aulas, las salas de terapia y el gimnasio de terapia",
      "Conozca a maestros, terapeutas y enfermeros",
      "Resuelva sus dudas sobre elegibilidad y cobertura",
      "Una visita tranquila y sin compromiso",
    ],
  },
} as const satisfies Widen<typeof en>;

export const contactCopy: Record<Locale, Widen<typeof en>> = { en, es };
